const cloudinary = require("cloudinary").v2;
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs"); // 

const app = express();
app.use(bodyParser.json());

cloudinary.config({ // Kenneths Cloudinary konto
  cloud_name: "djskwgibn",
  api_key: "815471325232252", 
  api_secret: "QcT6ufvgA1TubTkevgXbGmSa49Y",
  secure: true,
});

// SQLite databaseforbindelse
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Batch-upload produkter
const products = [
  { filePath: path.join(__dirname, "../img/cappuccino.jpg"), name: "Cappuccino", price: 35 },
  { filePath: path.join(__dirname, "../img/espresso.jpg"), name: "Espresso", price: 35 },
  { filePath: path.join(__dirname, "../img/apple_juice.jpg"), name: "Apple Juice", price: 25 },
  { filePath: path.join(__dirname, "../img/orange_juice.jpg"), name: "Orange Juice", price: 25 },
  { filePath: path.join(__dirname, "../img/grapes.jpg"), name: "Grapes", price: 20 },
  { filePath: path.join(__dirname, "../img/pineapple_juice.jpg"), name: "Pineapple Juice", price: 30 },
];

// Funktion til at uploade et billede til Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `joe-products/${path.basename(filePath, path.extname(filePath))}`,
      resource_type: "image",
    });
    console.log(`Billede uploadet: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("Fejl ved upload til Cloudinary:", error.message);
    throw error;
  }
};

// Funktion til at indsætte et produkt i databasen
const insertProductToDatabase = (name, imageUrl, price) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO products (name, image, price) VALUES (?, ?, ?)`;
    db.run(query, [name, imageUrl, price], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, name, imageUrl, price });
      }
    });
  });
};

// Håndter hele processen for et enkelt produkt
const processProduct = async (product) => {
  try {
    const imageUrl = await uploadToCloudinary(product.filePath);
    const insertedProduct = await insertProductToDatabase(
      product.name,
      imageUrl,
      product.price
    );
    console.log("Produkt tilføjet til databasen:", insertedProduct);
  } catch (error) {
    console.error(`Fejl ved behandling af produkt ${product.name}:`, error.message);
  }
};

// Batch-upload af alle produkter
const uploadProducts = async () => {
  for (const product of products) {
    await processProduct(product);
  }
  console.log("Alle produkter er uploadet og indsat i databasen.");
};

uploadProducts().catch((error) => {
  console.error("Fejl ved batch-upload af produkter:", error.message);
});

// Start processen
uploadProducts();