/*const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite");

// Opretter en tabel som indeholder primærnøgle id, url, tidspunkt og caption
db.serialize(() => {
  db.run(
    "CREATE TABLE if not exists customers (phone_number TEXT PRIMARY KEY, password TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, loyalty_counter INTEGER DEFAULT 0, datetime integer)",
    "CREATE TABLE if not exists products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, image TEXT NOT NULL, price NUMBER NOT NULL)"
  );
});

// Opretter en tabel som indeholder produktId som primærnøgle, navn , billede (som linker til billederne i mappen img, når de indsættes)
// og derudover indeholder en pris (tal)*/

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    return;
  }
  console.log("Connected to SQLite database.");
});

db.serialize(() => { // db.serialize() bruges til at udføre flere SQL-forespørgsler i rækkefølge
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      phone_number TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      loyalty_counter INTEGER DEFAULT 0,
      datetime INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      price NUMBER NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      console.log("Tables initialized successfully.");
    }
  });
});

// Close the database connection when done
process.on("exit", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
  });
});

//Kode til at tømme customer databasen for data
/*
db.serialize(() => {
  // Delete all data from the "customers" table
  db.run("DELETE FROM customers", (err) => {
    if (err) {
      console.error("Error deleting data from customers table:", err.message);
    } else {
      console.log("All data deleted from customers table.");
    }
  });
  //Kode til at tømme products databasen for data
    db.run("DELETE FROM products", (err) => {
    if (err) {
      console.error("Error deleting data from products table:", err.message);
    } else {
      console.log("All data deleted from products table.");
    }
  });
});*/


module.exports = db;


