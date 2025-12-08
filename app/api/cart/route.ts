import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Fetch user's cart
export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Get active cart
        const [cartRows]: any = await pool.execute('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [session.id]);

        if (cartRows.length === 0) {
            return NextResponse.json({ items: [] });
        }

        const cartId = cartRows[0].id;

        // Get items with product details
        const query = `
            SELECT ci.id, ci.quantity, ci.color, ci.size, p.title, p.price, p.imageUrl, p.product_id as productId 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `;
        // Note: Using p.id directly or if schema has product_id, assume p.id is the product id.
        // My query joins on p.id, so I should select p.id as something specific if needed or just p.id

        const [items]: any = await pool.execute(`
            SELECT ci.id as itemId, ci.quantity, ci.color, ci.size, p.id as productId, p.title, p.price, p.imageUrl 
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cartId]);

        return NextResponse.json({ items });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

// POST: Add to cart
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { productId, quantity, color, size } = await request.json();

        // Check/Create Cart
        let [cartRows]: any = await pool.execute('SELECT id FROM carts WHERE user_id = ? AND status = "active"', [session.id]);
        let cartId;

        if (cartRows.length === 0) {
            const [result]: any = await pool.execute('INSERT INTO carts (user_id, status) VALUES (?, "active")', [session.id]);
            cartId = result.insertId;
        } else {
            cartId = cartRows[0].id;
        }

        // Check if item exists in cart (same product, color, size)
        const [existing]: any = await pool.execute(
            'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND color = ? AND size = ?',
            [cartId, productId, color, size]
        );

        if (existing.length > 0) {
            // Update quantity
            await pool.execute('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            // Insert new
            await pool.execute(
                'INSERT INTO cart_items (cart_id, product_id, quantity, color, size) VALUES (?, ?, ?, ?, ?)',
                [cartId, productId, quantity, color, size]
            );
        }

        return NextResponse.json({ message: 'Added to cart' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}

// DELETE: Remove item
// Actually DELETE usually takes ID in URL, but let's do simple body/query for now or assuming we pass ID
