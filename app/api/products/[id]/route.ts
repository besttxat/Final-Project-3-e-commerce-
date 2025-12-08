
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const [rows]: any = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
