const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./db.sqlite");

// Function to insert products into the database
function insertProducts() {
  const products = [
    {
      navn: "Orange Juice",
      image: "/static/img/orange_juice.jpg",
      pris: 20
    },
    {
      navn: "Apple Juice",
      image: "/static/img/apple_juice.jpg",
      pris: 20
    },
    {
      navn: "Grape Juice",
      image: "/static/img/grapes.jpg",
      pris: 25
    },
    {
      navn: "Pineapple Juice",
      image: "/static/img/pineapple_juice.jpg",
      pris: 25
    },
    {
      navn: "Espresso",
      image: "/static/img/espresso.jpg",
      pris: 35
    },
    {
      navn: "Cappuccino",
      image: "/static/img/cappuccino.jpg",
      pris: 35
    }
  ];

  insertProducts();

  products.forEach(product => {
    db.run(
      `INSERT INTO products (name, image, price) VALUES (?, ?, ?)`,
      [product.navn, product.image, product.pris],
      function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      }
    );
  });
}

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