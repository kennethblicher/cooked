const cloudinary = require("cloudinary").v2;
const path = require("path");
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

console.log("Cloudinary-konfiguration:", cloudinary.config());


// Fil, der skal uploades
const videos = [
    { filePath: path.join(__dirname, "../video/Video1.mp4"), name: "Make a shake with Nick kyrgios" },
    { filePath: path.join(__dirname, "../video/Video2.mp4"), name: "How to enjoy a JOE sandwich" },
    { filePath: path.join(__dirname, "../video/Video3.mp4"), name: "Creating the perfect JOE coffee" },
    { filePath: path.join(__dirname, "../video/Video4.mp4"), name: "The secret behind the best Tuna mousse matcha" },
];


// Funktion til at uploade filer til Cloudinary
const uploadToCloudinary = async (filePath, publicId) => {
    try {
        console.log(`Starter upload af: ${filePath}`);
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            resource_type: "auto", // Sørg for, at det er angivet som video
        });
        console.log(`Video uploadet med succes: ${result.secure_url}`);
        return result.secure_url;
    } catch (error) {
        console.error("Fejl ved upload til Cloudinary:", error); // Log hele fejlen
        throw error;
    }
};

const processVideo = async (video) => {
    try {
        // Upload filen til Cloudinary og hent URL
        const publicId = `joe-products/${path.basename(
            video.filePath,
            path.extname(video.filePath)
        )}`;
        const url = await uploadToCloudinary(video.filePath, publicId);

        // Forbered data til at sende til databasen
        const videoData = {
            name: video.name,
            URL: url, // Brug den returnerede URL fra Cloudinary
        };

        // Log før afsendelse
        console.log("Sender data til /addVideo:", videoData);

        // POST anmodning til backend
        // POST anmodning til backend
        const response = await fetch("/addVideo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(videoData),
        });

        // Håndter responsen fra serveren
        if (!response.ok) {
            const errorText = await response.text();
            console.error("POST til /addVideo fejlede:", errorText);
            throw new Error(`POST til /addVideo fejlede: ${errorText}`);
        }


        const result = await response.json();
        console.log(`Videoen "${video.name}" blev tilføjet med URL: ${url}`);
        return result;
    } catch (error) {
        console.error(`Fejl ved behandling af video "${video.name}":`, error.message);
    }
};

// Batch-upload af videoer
const uploadVideos = async () => {
    for (const video of videos) {
        await processVideo(video);
    }
    console.log("Alle produkter er uploadet til Cloudinary.");
};

// Start batch-upload
uploadVideos().catch((error) => {
    console.error("Fejl ved batch-upload af videoer:", error.message);
});

console.log("Absolut sti til video:", path.resolve(__dirname, "../video/cbs.mp4"));
