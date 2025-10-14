import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la DB:', err);
        return;
    }
    console.log('Conectado correctamente a la base de datos');
});

db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
        console.error('Error leyendo productos:', err);
        return;
    }
    console.log('Productos en DB:', results);
});

export default db;