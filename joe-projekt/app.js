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

const crypto = require('crypto'); // Til at generere en unik sessions-id





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
  res.sendFile(path.join(__dirname, "public", "register.html"));
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

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/products', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/tutorials', (req, res) => {

  res.sendFile(path.join(__dirname, 'public', 'tutorials.html'));
});





// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));


app.get("/res", (req, res) => {
  res.send("Response message from server");
}); 





//Endpoint til at logge ind.
app.post('/loginUser', (req, res) => {
  const { number, password } = req.body;
  console.log('Request received at /login'); // Log request receipt
  console.log('Request body:', req.body); // Log the incoming request body
  if (!number || !password) {
      console.error('Missing number or password in request'); // Debugging log
      return res.status(400).send({ message: 'Number and password are required' });
  }

  const query = 'SELECT password FROM customers WHERE phone_number = ?';
  db.get(query, [number], async (err, row) => {
      if (err) {
          console.error('Database error:', err.message); // Debugging log
          return res.status(500).send({ message: 'Internal Server Error' });
      }

      if (!row) {
          console.log(`No user found with number: ${number}`); // Debugging log
          return res.status(401).send({ message: 'Invalid number or password' });
      }

      try {
          const isPasswordValid = await bcrypt.compare(password, row.password);
          console.log('Password validation result:', isPasswordValid); // Debugging log

          if (isPasswordValid) {
            // Generer en unik sessions-id
            const sessionId = crypto.randomBytes(16).toString('hex');
    
            // Gem sessionen i serverens hukommelse (eller database)
            // Her bruger vi en simpel in-memory session til eksemplet
            sessions[sessionId] = { userId: row.id, number };
    
            // Sæt session-id som en cookie
            res.cookie('sessionId', sessionId, {
              httpOnly: true, // Forhindrer adgang via JavaScript
              secure: false, // Sæt til true i produktion med HTTPS
              maxAge: 3600000, // 1 time
              sameSite: 'Strict', // Beskyt mod CSRF
            });


              console.log(`User with number ${number} successfully logged in`); // Debugging log
              return res.status(200).send({ message: 'Login successful' });
          } else {
              console.warn('Password mismatch'); // Debugging log
              return res.status(401).send({ message: 'Invalid number or password' });
          }
      } catch (error) {
          console.error('Error comparing passwords:', error.message); // Debugging log
          return res.status(500).send({ message: 'Internal Server Error' });
      }
  });
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

  // Query to check if the phone number exists in the database
  const query = 'SELECT phone_number FROM customers WHERE phone_number = ?';

  db.get(query, [tlfNumber], async (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    if (row) {
      // If phone number exists in the database
      console.log(`Phone number ${tlfNumber} already exists.`);
      return res.status(409).send({ message: 'Phone number already registered' });
    }

    // If phone number does not exist, proceed with Twilio verification
    try {
      const verification = await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: tlfNumber,
          channel: 'sms',
        });

      res.send({ status: verification.status });
    } catch (error) {
      console.error('Error sending verification code:', error.message);
      res.status(500).send({ message: 'Failed to send verification code' });
    }
  });
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

    res.send({ message: "Code sent" });
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(password, tlfNumber, name, email);
    const query = `
      INSERT INTO customers (phone_number, password, name, email)
      VALUES (?, ?, ?, ?)
    `;
    db.run(query, [tlfNumber, passwordHash, name, email], function (err) {
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
    console.error("Error sending message:", error);
    res.status(500).send({ message: "Failed to send code" });
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




// COOKIES!
const sessions = {}; // Simpel in-memory session (kan erstattes med database)

function authenticateSession(req, res, next) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).send({ message: 'Not authenticated' });
  }

  // Gem brugerdata i request-objektet
  req.user = sessions[sessionId];
  next();
}

app.get('/protected', authenticateSession, (req, res) => {
  res.send(`Welcome, user with ID: ${req.user.userId}`);
});


app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;

  if (sessionId) {
    delete sessions[sessionId]; // Fjern sessionen fra serveren
    res.clearCookie('sessionId'); // Fjern cookien
  }

  res.status(200).send({ message: 'Logged out successfully' });
});



// Porten 
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
