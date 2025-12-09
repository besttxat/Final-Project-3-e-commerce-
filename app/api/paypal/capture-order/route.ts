import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

const PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com';

// Get PayPal Access Token
async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
    }

    return data.access_token;
}

// Handle PayPal redirect after approval (GET request)
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const paypalOrderId = url.searchParams.get('token');
        const payerID = url.searchParams.get('PayerID');

        if (!paypalOrderId) {
            return NextResponse.redirect(new URL('/checkout?error=missing_token', request.url));
        }

        const session: unknown = await getSession();

        if (!session || typeof session !== 'object' || !('id' in session)) {
            return NextResponse.redirect(new URL('/signin?redirect=/checkout', request.url));
        }

        const userId = (session as { id: number }).id;

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Capture the order
        const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const captureData = await captureResponse.json();

        if (!captureResponse.ok) {
            console.error('PayPal capture error:', captureData);
            return NextResponse.redirect(new URL('/checkout?error=capture_failed', request.url));
        }

        // Verify payment was captured
        if (captureData.status !== 'COMPLETED') {
            return NextResponse.redirect(new URL(`/checkout?error=payment_${captureData.status}`, request.url));
        }

        // Get cart items for order creation
        const [cartRows]: [Array<{ id: number }>, unknown] = await pool.execute(
            'SELECT * FROM carts WHERE user_id = ? AND status = \'active\'',
            [userId]
        ) as [Array<{ id: number }>, unknown];

        if (cartRows.length === 0) {
            return NextResponse.redirect(new URL('/checkout?error=cart_not_found', request.url));
        }

        const cartId = cartRows[0].id;
        const [items]: [Array<{ product_id: number; quantity: number; price: string | number; color?: string; size?: string }>, unknown] = await pool.execute(
            `SELECT ci.*, p.price, p.title 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        ) as [Array<{ product_id: number; quantity: number; price: string | number; color?: string; size?: string }>, unknown];

        // Calculate total
        const subtotal = items.reduce((acc: number, item) => acc + (Number(item.price) * item.quantity), 0);
        const discount = subtotal * 0.2;
        const deliveryFee = 15;
        const total = subtotal - discount + deliveryFee;

        // Create Order in database
        const [orderResult]: [{ insertId: number }, unknown] = await pool.execute(
            'INSERT INTO orders (user_id, amount, status, charge_id, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, total, 'paid', paypalOrderId, 'paypal']
        ) as [{ insertId: number }, unknown];
        const orderId = orderResult.insertId;

        // Create Order Items
        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.color || null, item.size || null]
            );
        }

        // Clear Cart
        await pool.execute('UPDATE carts SET status = \'completed\' WHERE id = ?', [cartId]);

        // Redirect to orders page with success
        const baseUrl = `${url.protocol}//${url.host}`;
        return NextResponse.redirect(new URL(`/orders?success=true&orderId=${orderId}`, baseUrl));

    } catch (error) {
        console.error('PayPal Capture Error:', error);
        return NextResponse.redirect(new URL('/checkout?error=server_error', request.url));
    }
}

// Keep POST for SDK-based capture (optional)
export async function POST(request: Request) {
    try {
        const session: unknown = await getSession();

        if (!session || typeof session !== 'object' || !('id' in session)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session as { id: number }).id;
        const { paypalOrderId } = await request.json();

        if (!paypalOrderId) {
            return NextResponse.json({ message: 'Missing PayPal Order ID' }, { status: 400 });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Capture the order
        const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const captureData = await captureResponse.json();

        if (!captureResponse.ok) {
            console.error('PayPal capture error:', captureData);
            return NextResponse.json({
                message: 'Failed to capture PayPal payment',
                details: captureData
            }, { status: 400 });
        }

        if (captureData.status !== 'COMPLETED') {
            return NextResponse.json({
                message: 'Payment not completed',
                status: captureData.status
            }, { status: 400 });
        }

        // Get cart items
        const [cartRows]: [Array<{ id: number }>, unknown] = await pool.execute(
            'SELECT * FROM carts WHERE user_id = ? AND status = \'active\'',
            [userId]
        ) as [Array<{ id: number }>, unknown];

        if (cartRows.length === 0) {
            return NextResponse.json({ message: 'Cart not found' }, { status: 400 });
        }

        const cartId = cartRows[0].id;
        const [items]: [Array<{ product_id: number; quantity: number; price: string | number; color?: string; size?: string }>, unknown] = await pool.execute(
            `SELECT ci.*, p.price, p.title 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        ) as [Array<{ product_id: number; quantity: number; price: string | number; color?: string; size?: string }>, unknown];

        const subtotal = items.reduce((acc: number, item) => acc + (Number(item.price) * item.quantity), 0);
        const discount = subtotal * 0.2;
        const deliveryFee = 15;
        const total = subtotal - discount + deliveryFee;

        const [orderResult]: [{ insertId: number }, unknown] = await pool.execute(
            'INSERT INTO orders (user_id, amount, status, charge_id, payment_method) VALUES (?, ?, ?, ?, ?)',
            [userId, total, 'paid', paypalOrderId, 'paypal']
        ) as [{ insertId: number }, unknown];
        const orderId = orderResult.insertId;

        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price, item.color || null, item.size || null]
            );
        }

        await pool.execute('UPDATE carts SET status = \'completed\' WHERE id = ?', [cartId]);

        return NextResponse.json({ success: true, orderId, paypalOrderId });

    } catch (error) {
        console.error('PayPal Capture Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
