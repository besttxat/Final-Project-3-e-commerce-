import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import Omise from 'omise';

const omise = Omise({
    publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || process.env.OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
});

export async function POST(request: Request) {
    try {
        const session: any = await getSession();
        console.log("Checkout Session Check:", session ? `User ID: ${session.id}` : "No Session");

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized: No active session found' }, { status: 401 });
        }

        const { amount, token, source } = await request.json();
        const userId = session.id;

        // Debug Omise Config
        if (!process.env.OMISE_SECRET_KEY) {
            console.error("Missing OMISE_SECRET_KEY");
            return NextResponse.json({ message: 'Server Configuration Error: Missing Payment Keys' }, { status: 500 });
        }

        // 1. Validate Cart items and recalculate total on server side for security
        // (For brevity, assuming client passes correct amount, BUT normally we fetch cart items here)
        // Let's being more secure: Fetch cart items.

        const [cartRows]: any = await pool.execute(
            'SELECT * FROM carts WHERE user_id = ? AND status = "active"',
            [userId]
        );

        if (cartRows.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }
        const cartId = cartRows[0].id;

        const [items]: any = await pool.execute(
            `SELECT ci.*, p.price, p.title 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        );

        if (items.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);
        // Apply discount and delivery logic same as frontend
        const discount = subtotal * 0.2;
        const deliveryFee = 15;
        const total = subtotal - discount + deliveryFee;

        // Convert to cents (satangs) for Omise
        const chargeAmount = Math.round(total * 100);

        // 2. Charge with Omise
        let charge;
        try {
            if (token) {
                // Credit Card
                charge = await omise.charges.create({
                    amount: chargeAmount,
                    currency: 'thb',
                    card: token,
                    description: `Order for User ${userId}`
                });
            } else if (source) {
                // PromptPay or other Source
                charge = await omise.charges.create({
                    amount: chargeAmount,
                    currency: 'thb',
                    source: source,
                    description: `Order for User ${userId}`
                });
                // Note: PromptPay usually requires a redirect or QR code display if status is pending.
                // For now, we handle immediate success or pending.
            } else {
                return NextResponse.json({ message: 'Missing payment token/source' }, { status: 400 });
            }
        } catch (omiseError: any) {
            return NextResponse.json({ message: 'Payment Failed', details: omiseError.message }, { status: 400 });
        }

        if (charge.status === 'failed') {
            return NextResponse.json({ message: 'Payment Failed', details: charge.failure_message }, { status: 400 });
        }

        // 3. Create Order
        const [orderResult]: any = await pool.execute(
            'INSERT INTO orders (user_id, amount, status, charge_id, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, total, charge.status === 'successful' ? 'paid' : (charge.status === 'pending' ? 'pending' : 'failed'), charge.id, token ? 'credit_card' : 'promptpay']
        );
        const orderId = orderResult.insertId;

        // 4. Create Order Items
        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.color, item.size]
            );
        }

        // 5. Clear Cart (or mark as completed)
        // Usually we mark as completed to keep history if using `carts` table for history, 
        // but here we have `orders` table. So we can just delete items or update status.
        // Let's update status to 'completed' and create a new fresh cart next time.
        await pool.execute('UPDATE carts SET status = "completed" WHERE id = ?', [cartId]);

        return NextResponse.json({ success: true, orderId, charge });

    } catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
