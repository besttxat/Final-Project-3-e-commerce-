import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Verify item belongs to user's active cart
        const [rows]: any = await pool.execute(`
            SELECT ci.id 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE ci.id = ? AND c.user_id = ? AND c.status = 'active'
        `, [id, session.id]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Item not found or unauthorized' }, { status: 404 });
        }

        await pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
