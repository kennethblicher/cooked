const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const responseTime = require('response-time')
const sqlite3 = require('sqlite3').verbose();
const db = require('./DB.js');
const app = express();
const bodyParser = require('body-parser');
const twilio = require("twilio");
const bcrypt = require('bcrypt');





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
app.use(bodyParser.json());

//
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get('/2FA', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '2FA.html'));
});

app.get('/Brugeroplysninger', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Brugeroplysninger.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'products', 'products.html'));
});


// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));


app.get("/res", (req, res) => {
  res.send("Response message from server");
}); 

// Opsætning af 2FA med Twilio
//Dokumentation https://www.twilio.com/en-us/blog/implement-2fa-twilio-verify-node
const accountSid = "AC789d4a67dd55c1d86d4a4141cd240361";
const authToken = "e3638f3c7f71d76b4a811011e0b45214";
const TWILIO_VERIFY_SERVICE_SID = 'VA462a930d5a0c35aa037f82f56c87d1ff'
const client = twilio(accountSid, authToken);

// Sender en SMS med en 2FA kode til brugeren
app.post('/send-2fa', async (req, res) => {
  const { tlfNumber } = req.body;

  const verification = await client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: tlfNumber,
      channel: 'sms',
    });

  res.send({ status: verification.status });
});

// Anvender telefonnummer og kode til at verificere brugeren
app.post('/verify-2fa', async (req, res) => {
  const { tlfNumber, userCode } = req.body;

  const verificationCheck = await client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: tlfNumber,
      code: userCode,
    });

  res.send({ status: verificationCheck.status });
});




// Endpoint to register a user som indsætter data til databasen, og hasher password
app.post("/registerUser", async (req, res) => {
  const { tlfNumber, password, name, email } = req.body;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(password, tlfNumber, name, email);

    const query = `
      INSERT INTO customers (phone_number, password, name, email)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [email], function (err) {
      if (err) {
        // Handle potential errors, such as duplicate phone numbers
        if (err.code === "SQLITE_CONSTRAINT") {
          res.status(409).send({ message: "Email eksisterer allerede" });
        } else {
          console.error("Database error:", err.message);
          res.status(500).send({ message: "Internal Server Error" });
        }
        return;
      }

      res.status(201).send({ message: "Bruger er oprettet", userId: this.lastID });
    });
  } catch (error) {
    console.error("Error hashing password:", error.message);
    res.status(500).send({ message: "Failed to register user" });
  }
});




// route til at lave cookies, IKKE IMPLEMENTERET ENDNU

app.get("/cookie", (req, res) => {
  res.cookie("taste", "chocolate");
  res.send("Cookie set");
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



// Porten 
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
