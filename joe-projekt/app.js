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
require('dotenv').config();






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


//

app.get("/check-cookie", (req, res) => {
  const userPhone = req.cookies.userPhone;

  if (userPhone) {
    return res.status(200).json({ exists: true, userPhone });
  }

  return res.status(401).json({ exists: false, message: "Not logget in" });
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

            const trimmedPhoneNumber = number.substring(3);

            res.cookie("userPhone", trimmedPhoneNumber, {
              httpOnly: true,
              secure: false, // Do not require HTTPS for the cookie
              maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
              sameSite: "lax", // Adjust sameSite to "lax" for more flexibility
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
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

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

  const trimmedPhoneNumber = tlfNumber.substring(3);
  console.log("Trimmed phone number:", trimmedPhoneNumber);

  res.cookie("userPhone", trimmedPhoneNumber, {
    httpOnly: true,
    secure: false, // Do not require HTTPS for the cookie
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    sameSite: "lax", // Adjust sameSite to "lax" for more flexibility
  });
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
        console.error("Database error:", err.message);
        return res.status(500).send({ message: "Internal Server Error" });
      }
      // Set the cookie if insertion was successful
      return res.status(201).send({ message: "User created", userId: this.lastID });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({ message: "Failed to register user" });
  }
});


// 
app.post('/addProduct', (req, res) => {
  const { name, imageUrl, price } = req.body;

  // Check if all required fields are provided
  if (!name || !imageUrl || !price) {
    return res.status(400).send({ message: 'Name, image, and price are required' });
  }
  console.log(req.body)

  // Insert product into the database
  const query = `
    INSERT INTO products (name, image, price)
    VALUES (?, ?, ?)
  `;

  db.run(query, [name, imageUrl, price], function (err) {
    if (err) {
      console.error('Error adding product to database:', err.message);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    // Send a success response with the product ID
    res.status(201).send({
      message: 'Product added successfully',
      productId: this.lastID,
    });
  });
});

// Endpoint til at vise produkter fra databasen
app.get('/showProducts', (req, res) => {

  const query = `
    SELECT * FROM products
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error querying products from database:', err.message);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    res.status(200).send({
      message: 'Products retrieved successfully',
      products: rows,
    });
  });
});

app.post('/buyProduct', async (req, res) => {
  const { productName } = req.body; // Only `productName` is taken from the request body
  const phone_number = req.cookies.userPhone; // Phone number is retrieved from the HttpOnly cookie
  const formattedPhoneNumber = `+45${phone_number}`; // Add +45 to the phone number

  // Validate request data
  if (!productName || !phone_number) {
    return res.status(400).send({ message: 'Product name and phone number are required' });
  }

  const messageBody = `Hello customer, your purchase of ${productName} has been confirmed. Thank you for shopping with us!`;

  try {
    // Create and send the SMS using Twilio
    const message = await client.messages.create({
      from: '+18504006662', // Replace with your Twilio phone number
      to: formattedPhoneNumber, // Use the phone number from the cookie
      body: messageBody,
    });

    console.log('Message sent:', message.sid);
    res.status(200).send({ message: 'Message sent successfully', sid: message.sid });
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).send({ message: 'Failed to send message', error: error.message });
  }
});


// Endpoint til at tilføje en video
app.post('/addVideo', (req, res) => {
  const { name, URL } = req.body;

  if (!name || !URL) {
    console.error("Manglende data i /addVideo:", req.body);
    return res.status(400).send({ message: 'Name and URL are required' });
  }



  console.log("Data modtaget i /addVideo:", req.body);

  // Indsæt data i databasen
  const query = `
    INSERT INTO tutorials (name, URL)
    VALUES (?, ?)
  `;

  db.run(query, [name, URL], function (err) {
    if (err) {
      console.error('Fejl ved tilføjelse til databasen:', err.message);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    console.log("Video tilføjet med ID:", this.lastID);
    res.status(201).send({
      message: 'Video added successfully',
      videoId: this.lastID,
    });
  });
});


// Get vidoer

app.get('/showVideos', (req, res) => {
  const query = `
    SELECT * FROM tutorials
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error querying videos from database:', err.message);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    console.log("Data hentet fra databasen:", rows); // Log video data fra databasen
    res.status(200).send({
      message: 'Videos retrieved successfully',
      videos: rows,
    });
  });
});


// Porten 
app.listen(4000, () => {
  console.log("Server listening on port 4000");
});
