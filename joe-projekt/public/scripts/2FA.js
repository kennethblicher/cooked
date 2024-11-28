async function check2FA() {
  const tlfNumber = document.getElementById('nummerInput').value;
  try {
    const response = await fetch('http://localhost:4000/send-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tlfNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send verification code');
    }

    sessionStorage.setItem('tlfNumber', tlfNumber);
    console.log(tlfNumber);
    window.location.href = "/2FA";
  } catch (error) {
    // Handle any errors that occur
    console.error('Error sending verification:', error.message);
    alert(`Error: ${error.message}`);
  }
}
async function handle2FA() {
  const userCode = document.getElementById('FaInput').value;
  const tlfNumber = sessionStorage.getItem('tlfNumber');
  console.log(tlfNumber);

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
      window.location.href = "/brugeroplysninger";
    } else {
      throw new Error('Verification failed');
    }
  } catch (error) {
    // Handle any errors that occur
    console.error('Error verifying code:', error.message);
    alert(`Error: ${error.message}`);
  }
}



