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

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  "https://c219_problemstatement.vercel.app",
  // "https://YOUR-frontend.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman/server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

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

app.post('/addcard', async (req, res) => {
    const {card_name, card_pic} = req.body
    try {
        let connection = await mysql.createConnection(dbConfig)
        await connection.execute('INSERT INTO defaultdb.cards (card_name, card_pic) VALUES (?, ?)', [card_name, card_pic])
        res.status(201).json({message: `Card ${card_name} added successfully`})
    }
    catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error - could not add card" + card_name})
    }
})

app.delete('/deletecard/:id', async (req, res) => {
const {id} = req.params
    try {
        let connection = await mysql.createConnection(dbConfig)
        const [result] = await connection.execute('DELETE FROM defaultdb.cards WHERE id = ?', [id])
        
        if (result.affectedRows === 0) {
            res.status(404).json({message: `Card with id ${id} not found`})
        } else {
            res.status(200).json({message: `Card with id ${id} deleted successfully`})
        }
    }
    catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error - could not delete card with id " + id})
    }
})

app.put('/updatecard/:id', async (req, res) => {
    const {id} = req.params
    const {card_name, card_pic} = req.body
    try {
        let connection = await mysql.createConnection(dbConfig)
        const [result] = await connection.execute('UPDATE defaultdb.cards SET card_name = ?, card_pic = ? WHERE id = ?', [card_name, card_pic, id])
        
        if (result.affectedRows === 0) {
            res.status(404).json({message: `Card with id ${id} not found`})
        } else {
            res.status(200).json({message: `Card ${card_name} updated successfully`})
        }
    }
    catch(err) {
        console.error(err);
        res.status(500).json({message: "Server error - could not update card with id " + id})
    }
})


app.listen(port, () => {
    console.log("Server running on port", port)
})
