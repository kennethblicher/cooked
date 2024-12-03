const cloudinary = require("cloudinary").v2;
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

cloudinary.config({
  cloud_name: "djskwgibn", // cloud_name
  api_key: "815471325232252", // api_key
  api_secret: "QcT6ufvgA1TubTkevgXbGmSa49Y", // api_secret
  secure: true,
});

const db = new sqlite3.Database("./db.sqlite");

// Opret eller initialiser tabellen for produkter
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      price REAL NOT NULL
    )`
  );
});

// Uploade billederne til Cloudinary
async function upload(file) {
  const uploadOptions = {
    public_id: "cdn-example/" + file.split(".")[0],
    resource_type: "auto",
  };
  try {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    await runQuery(
      "INSERT INTO products (url, name, price) VALUES (?, ?, ?)",
      [result.secure_url, , name, price]);
    console.log(result);
    getUploads();
  } catch (error) {
    console.error(error);
  }
}
async function getUploads() {
  try {
    const uploads = await allQuery("SELECT * FROM uploads");
    console.log("Data from SQLite database:");
    console.log(uploads);
  } catch (error) {
    console.error(`Error: `, error.message);
  }
}

upload("/img/cappuccino.jpg");
upload("/img/espresso.jpg");
upload("/img/apple_juice.jpg");
upload("/img/orange_juice.jpg");
upload("/img/grapes.jpg");
upload("/img/pineapple_juice.jpg");

/* Hente produkter fra databasen
function getProducts(req, res) {
  db.all("SELECT id, name, image, price FROM products", (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).send({ message: "Fejl ved hentning af produkter" });
    } else {
      res.json(rows);
    }
  });
}
  */