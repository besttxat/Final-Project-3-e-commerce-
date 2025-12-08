import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.id;

        // Fetch orders
        const [orders]: any = await pool.execute(
            `SELECT * FROM orders WHERE user_id = ? ORDER BY createdAt DESC`,
            [userId]
        );

        // Fetch order items for each order
        // Note: For better performance in large systems, we might do a single join query and restructure in JS, 
        // or just fetch basics first. For now, let's just fetch items if we want to show them in the list.
        // Or simpler: The "My Orders" list usually shows Order ID, Date, Status, Total, and maybe "View Details".
        // Let's just return orders first. If we want details, we can fetch them separately or join.
        // Let's doing a simple join to get product names for display like "T-shirt... and 2 items".

        // Actually, fetching everything is fine for now.
        for (const order of orders) {
            const [items]: any = await pool.execute(
                `SELECT oi.*, p.title, p.imageUrl 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get Orders Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
