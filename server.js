const express = require('express')
const mysql = require('mysql2/promise');
require('dotenv').config()
const port = 3000

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
}

const app = express()
app.use(express.json())

app.get('/allcards', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig)
        const [rows] = await connection.query("SELECT * FROM defaultdb.cards")
        res.json(rows);
    }
    catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error for allcards"})
    }
})


app.listen(port, () => {
    console.log("Server running on port", port)
})
