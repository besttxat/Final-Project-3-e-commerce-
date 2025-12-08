const mysql = require('mysql2/promise');
require('dotenv').config();

async function addProducts() {
    const connection = await mysql.createConnection({
        ...(process.env.DB_SOCKET_PATH
            ? { socketPath: process.env.DB_SOCKET_PATH }
            : { host: process.env.DB_HOST || '127.0.0.1' }),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '204218',
        database: process.env.DB_NAME || 'e-commerce'
    });

    try {
        console.log('Connected to MySQL server.');

        const newProducts = [
            {
                title: "Classic Chino Shorts",
                price: 450,
                rating: 4.8,
                imageUrl: "/shorts.png",
                category: "shorts",
                description: "Premium cotton chino shorts, perfect for a casual summer look. Breathable fabric and comfortable fit."
            },
            {
                title: "Urban Street Hoodie",
                price: 1290,
                rating: 4.9,
                imageUrl: "/hoodie.png",
                category: "hoodie",
                discount: 10,
                originalPrice: 1450,
                description: "High-quality heavyweight cotton hoodie. Essential streetwear piece with a relaxed fit."
            }
        ];

        for (const p of newProducts) {
            await connection.execute(
                'INSERT INTO products (title, price, rating, imageUrl, category, discount, originalPrice, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [p.title, p.price, p.rating, p.imageUrl, p.category, p.discount || null, p.originalPrice || null, p.description]
            );
            console.log(`Added: ${p.title}`);
        }

        console.log('Successfully added new products!');

    } catch (err) {
        console.error('Error adding products:', err);
    } finally {
        await connection.end();
    }
}

addProducts();
