const cloudinary = require("cloudinary").v2;
const path = require("path");
const db = require('../../DB.js');
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Cloudinary-konfiguration
cloudinary.config({
  cloud_name: "djskwgibn", // Kenneths Cloudinary konto
  api_key: "815471325232252",
  api_secret: "QcT6ufvgA1TubTkevgXbGmSa49Y",
  secure: true,
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

// Funktion til at uploade filer til Cloudinary
const uploadToCloudinary = async (filePath, product) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `joe-products/${path.basename(filePath, path.extname(filePath))}`,
      resource_type: "image",
    });

    console.log(`Billede uploadet: ${result.secure_url}`);

    // Return the image URL along with the product name and price
    return {
      url: result.secure_url,
      name: product.name,
      price: product.price,
    };
  } catch (error) {
    console.error("Fejl ved upload til Cloudinary:", error.message);
    throw error;
  }
};

// Håndter hele processen for et enkelt produkt
const processProduct = async (product) => {
  try {
    // Upload the image and retrieve the URL, name, and price
    const { url, name, price } = await uploadToCloudinary(product.filePath, product);

    // Prepare product data with the uploaded image URL
    const productData = {
      name,
      price,
      imageUrl: url,
    };

    // Post the product data to your server
    const response = await fetch("http://localhost:4000/addProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData), // Convert product data to JSON
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add product");
    }

    const result = await response.json();
    console.log(`Produktet "${name}" blev tilføjet med billede: ${url}`);
    return result;
  } catch (error) {
    console.error(`Fejl ved behandling af produkt ${product.name}:`, error.message);
  }
};

// Batch-upload af alle produkter
const uploadProducts = async () => {
  for (const product of products) {
    await processProduct(product);
  }
  console.log("Alle produkter er uploadet til Cloudinary.");
};

// Start processen
uploadProducts().catch((error) => {
  console.error("Fejl ved batch-upload af produkter:", error.message);
});



async function showProducts() {
  try {
    // Fetch products from the backend
    const response = await fetch("http://localhost:4000/showProducts");

    // Check if the response is successful
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    // Parse the JSON response
    const data = await response.json();

    // Find the container where products will be displayed
    const productList = document.getElementById("product-list");

    // Clear any existing content
    productList.innerHTML = "";

    // Loop through the products and display them
    data.products.forEach((product) => {
      // Create a container for each product
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      // Create an image element
      const img = document.createElement("img");
      img.src = product.image; // Use the image URL from the product data
      img.alt = product.name; // Use the product name as alt text
      img.style.width = "200px"; // Optional: Set image width

      // Create a name element
      const name = document.createElement("h3");
      name.textContent = product.name; // Set the product name

      // Create a price element
      const price = document.createElement("p");
      price.textContent = `Price: $${product.price}`; // Set the product price

      // Append the elements to the product container
      productDiv.appendChild(img);
      productDiv.appendChild(name);
      productDiv.appendChild(price);

      // Append the product container to the product list
      productList.appendChild(productDiv);
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    alert("Failed to load products. Please try again later.");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  showProducts();
});