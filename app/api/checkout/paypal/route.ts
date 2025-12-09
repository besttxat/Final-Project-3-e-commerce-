import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session: any = await getSession();
        console.log("PayPal Checkout Session Check:", session ? `User ID: ${session.id}` : "No Session");

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized: No active session found' }, { status: 401 });
        }

        const { paypalOrderId, amount } = await request.json();
        const userId = session.id;

        if (!paypalOrderId) {
            return NextResponse.json({ message: 'Missing PayPal Order ID' }, { status: 400 });
        }

        // Validate Cart items (same as regular checkout)
        const [cartRows]: any = await pool.execute(
            'SELECT * FROM carts WHERE user_id = ? AND status = \'active\'',
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

        // Create Order
        const [orderResult]: any = await pool.execute(
            'INSERT INTO orders (user_id, amount, status, charge_id, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, total, 'paid', paypalOrderId, 'paypal']
        );
        const orderId = orderResult.insertId;

        // Create Order Items
        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.color, item.size]
            );
        }

        // Clear Cart
        await pool.execute('UPDATE carts SET status = \'completed\' WHERE id = ?', [cartId]);

        return NextResponse.json({ success: true, orderId, paypalOrderId });

    } catch (error) {
        console.error('PayPal Checkout Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
