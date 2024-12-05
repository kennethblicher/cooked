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
const video = [
  { filePath: path.join(__dirname, "../video/cbs.mp4"), name: "Test"},

];

// Funktion til at uploade filer til Cloudinary
const uploadToCloudinary = async (filePath, video) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: `joe-products/${path.basename(filePath, path.extname(filePath))}`,
      resource_type: "auto",
    });

    console.log(`Video uploadet: ${result.secure_url}`);

    // Return the image URL along with the video name and price
    return {
      url: result.secure_url,
      name: video.name,
    };
  } catch (error) {
    console.error("Fejl ved upload til Cloudinary:", error.message);
    throw error;
  }
};

// Håndter hele processen for et enkelt produkt
const processVideo = async (video) => {
  try {
    // Upload the image and retrieve the URL, name, and price
    const { url, name } = await uploadToCloudinary(video.filePath, video);

    // Prepare video data with the uploaded image URL
    const videoData = {
      name,
      URL: url,
    };

    // Post the video data to your server
    const response = await fetch("http://localhost:4000/addVideo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(videoData), // Convert video data to JSON
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add video");
    }

    const result = await response.json();
    console.log(`Videoen "${name}" blev tilføjet med videoen: ${url}`);
    return result;
  } catch (error) {
    console.error(`Fejl ved behandling af videoen ${video.name}:`, error.message);
  }
};

// Batch-upload af alle produkter
const videos = [
    { filePath: path.join(__dirname, "../video/cbs.mp4"), name: "Test" },
  ];
  
  const uploadVideos = async () => {
    for (const video of videos) {
      await processVideo(video);
    }
    console.log("Alle videoer er uploadet til Cloudinary.");
  };