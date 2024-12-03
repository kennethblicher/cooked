const responseDom = document.getElementById("response");
const cookieDom = document.getElementById("cookie");
const locationDom = document.getElementById("location");
const latlongDom = document.getElementById("latlong");
const weatherDom = document.getElementById("weather");
const emailDom = document.getElementById("email");
const emailInputDom = document.getElementById('emailInput');
const usernameInputDom = document.getElementById('usernameInput');
const passwordInputDom = document.getElementById('passwordInput');
const loginDom = document.getElementById('login');

// async funktion med await
async function getResponse() {
  // try catch blok
  try {
    // fetch data fra /res endpoint og await responsen
    const response = await fetch('/res');
    
    // hvis responsen ikke er ok, kast en fejl
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // konverter responsen til tekst
    const data = await response.text(); 
    
    // håndter succes
    console.log(data);
    responseDom.innerHTML = data;
  } catch (error) {
    // håndter fejl
    console.log(error);
    responseDom.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

// async funktion med await
async function setCookie() {
    // try catch blok
    try {
      // fetch data fra /res endpoint og await responsen
      const response = await fetch('/cookie');

      // hvis responsen ikke er ok, kast en fejl
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // konverter responsen til tekst
      const value = await response.text();

      // håndter succes
      console.log(value);
      cookieDom.innerHTML = value;
    } catch (error) {
      // håndter fejl
      console.log(error);
      cookieDom.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}<<<<<<< Updated upstream
/*************************************
 * Skal vel slettes?
 */
// funktion til at hente placering
async function getLocation() {
  const dropdown = document.getElementById('locationDropdown');
  const selectedLocation = dropdown.options[dropdown.selectedIndex].text;
  locationDom.innerHTML = `Your location is ${selectedLocation}`;
  document.cookie = `location=${selectedLocation}; path=/;`;
  await getLatLong(selectedLocation);
}

// async funktion med await
async function getLatLong(locationName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&addressdetails=1`;
  // try catch blok
  try {
    // fetch data fra /res endpoint og await responsen
    const response = await fetch(url);

    // hvis responsen ikke er ok, kast en fejl
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // konverter responsen til json
    const data = await response.json();

    // håndter succes
    if (data.length > 0) {
      console.log(data);
      latlongDom.innerHTML = `Latitude: ${data[0].lat}, Longitude: ${data[0].lon}`;
      await getWeather(data[0].lat, data[0].lon);
    } else {
      throw new Error('No results found');
    } 
  } catch (error) {
    // håndter fejl
    console.log(error);
    latlongDom.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

=======
>>>>>>> Stashed changes



// async funktion med await
async function login() {
  // try catch blok
  try {
    // fetch POST request for /email endpoint og await responsen
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: usernameInputDom.value, password: passwordInputDom.value }),
    });

    // hvis responsen ikke er ok, kast en fejl
    if (!response.ok) {
      throw new Error(`HTTP statuskode ${response.status}`);
    }

    // håndter succes
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      location.href = "/protected";
    }

} catch (error) {
    // håndter fejl
    console.log(error);
    loginDom.innerHTML = `<p>Fejl: ${error.message}</p>`;
  }
}


document.addEventListener('DOMContentLoaded', function () {
  // Create a new <p> element
  const paragraph = document.createElement('p');

  // Append the <p> element to the body
  document.body.appendChild(paragraph);
  const responseTimeParagraph = document.getElementById('responseTimeValue');

  // Send a GET request using the fetch API
  fetch('/', {
      method: 'GET',
      headers: {
          'Cache-Control': 'no-cache',
      },
  })
      .then((response) => {
          // Get the value of the X-Response-Time header
          const responseTimeHeader = response.headers.get('X-Response-Time');

          // Display the header value in the paragraph
          responseTimeParagraph.textContent = `X-Response-Time: ${responseTimeHeader}`;
      })
      .catch((error) => {
          console.error('Error:', error);
      });
});

// -------------------------------- SIGNUP.HTML --------------------------

// Find login-knappen
const loginButton = document.getElementById('loginButton');

// Tilføj en klik-hændelse
loginButton.addEventListener('click', () => {
  // Naviger til register.html
  window.location.href = '/joe-projekt/public/signup.html';
});

// Find knappen
const continueButton = document.getElementById('continueButton');

// ---------------------- 2FA.HTML -----------------------------

// Tilføj en klik-hændelse til knappen
continueButton.addEventListener('click', () => {
  // Naviger til den ønskede side
  window.location.href = '/joe-projekt/public/2FA.html';
});

// ---------------------- Brugeroplysninger.html -------------------------------

// Find elementerne
const signupButton = document.getElementById('signupButton');
const passwordInput = document.getElementById('passwordInput');
const repeatPasswordInput = document.getElementById('repeatPasswordInput');
const errorMessage = document.getElementById('errorMessage');

// Tilføj klik-hændelse til "Opret bruger"-knappen
signupButton.addEventListener('click', () => {
  // Tjek om adgangskoderne matcher
  if (passwordInput.value !== repeatPasswordInput.value) {
    errorMessage.style.display = 'block'; // Vis fejlbesked
  } else {
    errorMessage.style.display = 'none'; // Skjul fejlbesked
    // Naviger til næste side
    window.location.href = '/joe-projekt/public/2FA.html';
  }
});
