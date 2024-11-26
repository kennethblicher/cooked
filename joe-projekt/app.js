const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const responseTime = require('response-time')
const sqlite3 = require('sqlite3').verbose();
const app = express();

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

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "copenhagenbusinessjoe@gmail.com",
    pass: "mzksmywihnpdjqjx",
  },
});

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

app.get("/locations", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "locations.html"));
});

app.get("/res", (req, res) => {
  res.send("Response message from server");
});

app.get("/cookie", (req, res) => {
  res.cookie("taste", "chocolate");
  res.send("Cookie set");
});

// Opgave 2: Lav et POST /email asynkront endpoint der sender en email til modtageren

// Tag imod modtagerens emailadresse i req.body og lav try catch for at sende email
// Brug console.log(req.body) for at se indholdet af req.body og få fat i emailadressen
// Link til dokumentation: https://expressjs.com/en/api.html#req.body

// Send svar tilbage til klienten om at emailen er sendt med res.json og et message objekt
// Link til dokumentation: https://expressjs.com/en/api.html#res.json

app.post("/email", async (req, res) => {
  const { email } = req.body;
  const sender = "JOE <copenhagenbusinessjoe@gmail.com>";
  const subjectMsg = "Welcome to JOE";
  const textMsg = "Welcome to JOE";
  const htmlMsg = "<h1>Welcome to JOE</h1>";

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: email,
      subject: subjectMsg,
      text: textMsg,
      html: htmlMsg,
    });
    console.log("Message sent: %s", info.messageId);
    res.json({ message: `Email sendt til ${email}` });
  } catch (error) {
    console.error(error);
    res.json({ message: "Email kunne ikke sendes" });
  }
});

const db = new sqlite3.Database('./DB.js');

app.get("/customer", (req, res) => {
  db.all("SELECT phone_number, password FROM database", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.json(rows);
  });
});

app.post("/login", (req, res) => {
  const { phone_number, password } = req.body;
  console.log(req.body);

  const query = "SELECT username FROM customers WHERE phone_number = ? AND password = ?";
  db.get(query, [phone_number, password], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (row) {
      res
        .cookie("userAuth", row.phone_number, {
          maxAge: 3600000,
        })
        .send({ message: "Du er blevet logget ind" })
        .status(200);
    } else {
      res.status(401).send({ message: "Forkert telefonnummer eller adgangskode" });
    }
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

app.get('/culture', (req, res) => {
  // Set Cache-Control header to prevent caching
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.sendFile(path.join(__dirname, "public", "culture.html"));
})

app.get('/culture/image', (req, res) => {
  // Set cache-control and pragma headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.sendFile(path.join(__dirname, "public/img", "cbs.jpeg"));
});


app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
