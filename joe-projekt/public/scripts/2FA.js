async function check2FA() {
  const tlfNumber = document.getElementById('nummerInput').value;
  try {
    // Make a POST request to the server
    const response = await fetch('http://localhost:4000/send-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tlfNumber }),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send verification code');
    }

    sessionStorage.setItem('tlfNumber', tlfNumber);
    window.location.href = "/2FA";
  } catch (error) {
    // Handle any errors that occur
    console.error('Error sending verification:', error.message);
    alert(`Error: ${error.message}`);
  }
}
async function handle2FA() {
  const userCode = document.getElementById('2FaInput').value;
  const tlfNumber = sessionStorage.getItem('tlfNumber');

  try {
    const response = await fetch('http://localhost:4000/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tlfNumber, userCode }),
    });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify code');
    }

    const data = await response.json();

    // Redirect if verification is approved
    if (data.status === 'approved') {
      window.location.href = "/index.html";
    } else {
      throw new Error('Verification failed');
    }
  } catch (error) {
    // Handle any errors that occur
    console.error('Error verifying code:', error.message);
    alert(`Error: ${error.message}`);
  }
}

/*async function check2FA() {
  const tlfNumber = document.getElementById("nummerInput").value;
console.log(tlfNumber)
  try {
    const response = await fetch("http://localhost:4000/send-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tlfNumber }),
    });

    if (!response.ok) {
      throw new Error("Failed to send 2FA code");
    }

    data = await response.json();
    realCode = data.code;
    console.log(realCode);
    alert("2FA code sent!");
    //window.location.href = "/2FA";

    return realCode
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to send 2FA code. Please try again.");
  }
}

async function handle2FA() {

  const userCode = document.getElementById("2FaInput").value;

  if (!userCode) {
    alert("Please enter both your phone number and the verification code.");
    return;
  }

  console.log("Phone number entered:", tlfNumber);
  console.log("User entered code:", userCode);

  try {
    const response = await fetch("http://localhost:4000/verify-2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tlfNumber, userCode }),
    });

    if (response.ok) {
      alert("Code verified! You are now logged in.");
      window.location.href = "/index.html"; // Redirect to your dashboard or another page
    } else {
      const errorData = await response.json();
      alert(errorData.message); // Displays "Incorrect verification code" or similar
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to verify the code. Please try again.");
  }
}*/
