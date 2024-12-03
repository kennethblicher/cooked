const cloudinary = require("cloudinary").v2;
const sqlite3 = require("sqlite3").verbose();

cloudinary.config({
  cloud_name: "djskwgibn", // cloud_name
  api_key: "815471325232252", // api_key
  api_secret: "QcT6ufvgA1TubTkevgXbGmSa49Y", // api_secret
  secure: true,
});

// SQLite3 er en database, der gemmer data i en fil
const db = new sqlite3.Database("./db.sqlite");

// Opretter en tabel som indeholder primærnøgle id, url, tidspunkt og caption
db.serialize(() => {
  db.run(
    "CREATE TABLE if not exists products (id integer primary key, url text not null, datetime integer, caption text)"
  );
});

// Funktion til at køre en SQLite "run" query
const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Funktion til at køre en SQLite "all" query
const allQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
};

async function upload(file) {
  const uploadOptions = {
    public_id: "cdn-example/" + file.split(".")[0],
    resource_type: "auto",
  };
  try {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    await runQuery(
      "INSERT INTO uploads (url, datetime, caption) VALUES (?, ?, ?)",
      [result.secure_url, Date.now(), result.original_filename]
    );
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