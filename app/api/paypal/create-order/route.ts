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
        console.error('PayPal auth error:', data);
        throw new Error('Failed to get PayPal access token');
    }

    return data.access_token;
}

// Create PayPal Order
export async function POST(request: Request) {
    try {
        const session: unknown = await getSession();

        if (!session || typeof session !== 'object' || !('id' in session)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session as { id: number }).id;
        // const { amount } = await request.json(); // Removed as amount is calculated from cart

        // Get cart for validation
        const [cartRows]: [Array<{ id: number }>, unknown] = await pool.execute(
            'SELECT * FROM carts WHERE user_id = ? AND status = \'active\'',
            [userId]
        ) as [Array<{ id: number }>, unknown];

        if (cartRows.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        const cartId = cartRows[0].id;
        const [items]: [Array<{ price: string | number; quantity: number }>, unknown] = await pool.execute(
            `SELECT ci.*, p.price, p.title 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = ?`,
            [cartId]
        ) as [Array<{ price: string | number; quantity: number }>, unknown];

        if (items.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        // Calculate total
        const subtotal = items.reduce((acc: number, item) => acc + (Number(item.price) * item.quantity), 0);
        const discount = subtotal * 0.2;
        const deliveryFee = 15;
        const total = subtotal - discount + deliveryFee;

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Get base URL from request
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;

        // Create PayPal order with redirect URLs
        const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: total.toFixed(2),
                        },
                        description: 'E-commerce Order',
                    },
                ],
                application_context: {
                    brand_name: 'E-Commerce Store',
                    landing_page: 'LOGIN',
                    user_action: 'PAY_NOW',
                    return_url: `${baseUrl}/api/paypal/capture-order`,
                    cancel_url: `${baseUrl}/checkout`,
                },
            }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            console.error('PayPal order creation error:', orderData);
            return NextResponse.json({
                message: 'Failed to create PayPal order',
                details: orderData
            }, { status: 400 });
        }

        // Find approval URL
        const approvalUrl = orderData.links?.find((link: { rel: string; href: string }) => link.rel === 'approve')?.href;

        return NextResponse.json({
            orderId: orderData.id,
            status: orderData.status,
            approvalUrl: approvalUrl,
        });

    } catch (error) {
        console.error('PayPal Create Order Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
