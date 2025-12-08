import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        let query = 'SELECT * FROM products WHERE 1=1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND title LIKE ?';
            params.push(`%${search}%`);
        }

        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }

        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }

        query += ' ORDER BY createdAt DESC';

        const [rows]: any = await pool.execute(query, params);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
