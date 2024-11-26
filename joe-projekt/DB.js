const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite");

// Opretter en tabel som indeholder primærnøgle id, url, tidspunkt og caption
db.serialize(() => {
  db.run(
    "CREATE TABLE if not exists customers (phone_number TEXT PRIMARY KEY, password TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, loyalty_counter INTEGER DEFAULT 0, datetime integer)"
  );
});

