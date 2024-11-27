const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const responseTime = require('response-time')
const sqlite3 = require('sqlite3').verbose();
const app = express();

const db = new sqlite3.Database("./db.sqlite");

app.use(cors());
app.use("/static", express.static("public"));
app.use((req, res, next) => {
  console.log("----- HTTP Request -----");
  console.log(`Method: ${req.method}`); // HTTP Method
  console.log(`URL: ${req.originalUrl}`); // Requested URL
  console.log("Headers:", req.headers); // Request Headers
  console.log(`IP: ${req.ip}`); // IP Address
  console.log("------------------------");
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(responseTime())


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/products", (req, res  ) => {  
  const serverUri = `${req.protocol}://${req.get('host')}`;
  const products = [
    {
      productName: "Orange Juice",
      imgsrc: `${serverUri}/static/img/orange_juice.jpg`
    },
    {
      productName: "Apple Juice",
      imgsrc: `${serverUri}/static/img/apple_juice.jpg`
    },
    {
      productName: "Grape Juice",
      imgsrc: `${serverUri}/static/img/grapes.jpg`
    },
    {
      productName: "Pineapple Juice",
      imgsrc: `${serverUri}/static/img/pineapple_juice.jpg`
    },
    {
      productName: "Espresso",
      imgsrc: `${serverUri}/static/img/espresso.jpg`
    },
    {
      productName: "Cappuccino",
      imgsrc: `${serverUri}/static/img/cappuccino.jpg`
    }
  ];
  res.json(products);
});


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/2FA', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '2FA.html'));
});

app.get('/Brugeroplysninger', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Brugeroplysninger.html'));
});



app.get("/res", (req, res) => {
  res.send("Response message from server");
});

app.get("/cookie", (req, res) => {
  res.cookie("taste", "chocolate");
  res.send("Cookie set");
});



// Nedstående kode gør x

app.post("/customers", (req, res) => {
  const { phone_number, password } = req.body;
  console.log(req.body);

  if (!phone_number || !password) {
    res.status(400).send({ message: "Phone number and password are required" });
    return;
  }

  const query = "INSERT INTO customers (phone_number, password, name, email) VALUES (@phone_number, @password, @name, @email)";
  db.run(query, [phone_number, password, name, email], function (err) {
    if (err) {
      // Handle potential errors, such as duplicate phone numbers
      if (err.code === "SQLITE_CONSTRAINT") {
        res.status(409).send({ message: "Telefonnummeret eksisterer allerede" });
      } else {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
      }
      return;
    }

    res.status(201).send({ message: "Bruger er oprettet", userId: this.lastID });
  });
});




app.get("/protected", (req, res) => {
  const authCookie = req.cookies.userAuth;

  if (!authCookie) {
    return res.status(401).send("Ingen authentication cookie.");
  }

  const customer = customers.find((user) => user.username === authCookie);

  if (!customer) {
    return res.status(401).send("Ugyldig cookie.");
  }

  res.send(`Velkommen ${customer.username}`);
});




app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
