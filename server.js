const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); //requires the ,env to hide sql pwd

const app = express(); 

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'employees_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to the employees_db database.');
});

const queryDB = (sql, params,res) => {
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
       res.status(500).json({ error: err.message });
    } else {
       res.json(results);
    }
  });
};

