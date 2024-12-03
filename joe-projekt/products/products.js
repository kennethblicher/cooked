const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite");
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Skal indsætte produkter i databasen her

// Henter produkter fra databasen
function getProducts(req, res) {
  db.all("SELECT name, image, price FROM products", (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.json(rows);
  });
}

module.exports = {
  insertProducts,
  getProducts
};

app.get("/products", getProducts);

// Serve the products.html file
app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));