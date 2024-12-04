

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




module.exports = db;


