const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const connection = await mysql.createConnection({
    ...(process.env.DB_SOCKET_PATH
      ? { socketPath: process.env.DB_SOCKET_PATH }
      : { host: process.env.DB_HOST || '127.0.0.1' }),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '204218',
  });

  try {
    console.log('Connected to MySQL server.');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'e-commerce'}\``);
    console.log(`Database '${process.env.DB_NAME || 'e-commerce'}' created or already exists.`);

    await connection.changeUser({ database: process.env.DB_NAME || 'e-commerce' });

    // Create Users table using pure SQL (no Prisma)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table `users` ready.');

    // Create Products table using pure SQL
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        originalPrice DECIMAL(10, 2),
        discount DECIMAL(5, 2),
        rating DECIMAL(3, 2) DEFAULT 0,
        imageUrl VARCHAR(255),
        category VARCHAR(100),
        colors JSON,
        sizes JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table `products` ready.');

    // Create Carts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `carts` ready.');

    // Create Cart Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        color VARCHAR(50),
        size VARCHAR(50),
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `cart_items` ready.');

    // Create Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        charge_id VARCHAR(255),
        payment_method VARCHAR(50),
        tracking_number VARCHAR(100),
        carrier VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `orders` ready.');

    // Create Order Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        color VARCHAR(50),
        size VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Table `order_items` ready.');

    // Seed initial data if empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log('Seeding products...');
      const products = [
        { title: "T-shirt with Tape Details", price: 120, rating: 4.5, imageUrl: "/p1.png", category: "t-shirts" },
        { title: "Skinny Fit Jeans", price: 240, rating: 3.5, imageUrl: "/p2.png", discount: 20, originalPrice: 260, category: "jeans" },
        { title: "Checkered Shirt", price: 180, rating: 4.5, imageUrl: "/p3.png", category: "shirts" },
        { title: "Sleeve Striped T-shirt", price: 130, rating: 4.5, imageUrl: "/p4.png", discount: 30, originalPrice: 160, category: "t-shirts" },
        { title: "Classic Chino Shorts", price: 450, rating: 4.8, imageUrl: "/shorts.png", category: "shorts" },
        { title: "Urban Street Hoodie", price: 1290, rating: 4.9, imageUrl: "/hoodie.png", discount: 10, originalPrice: 1450, category: "hoodie" }
      ];

      for (const p of products) {
        await connection.execute(
          'INSERT INTO products (title, price, rating, imageUrl, category, discount, originalPrice) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.title, p.price, p.rating, p.imageUrl, p.category, p.discount || null, p.originalPrice || null]
        );
      }
      console.log('Seeded 4 mock products.');
    } else {
      console.log('Products table already has data, skipping seed.');
    }

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await connection.end();
  }
}

setup();
