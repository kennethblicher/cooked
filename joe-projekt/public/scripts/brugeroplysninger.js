async function userInput() {
    const name = document.getElementById('nameInput').value
    const email = document.getElementById('emailInput').value
    const password1 = document.getElementById('passwordInput').value
    const password2 = document.getElementById('repeatPasswordInput').value
    const tlfNumber = sessionStorage.getItem('tlfNumber');

    if (!tlfNumber) {
        const newTlfNumber = prompt('Phone number not found. Please enter your phone number again:');
        if (!newTlfNumber) {
            alert('Phone number is required to register.');
            return;
        }
    }


    if (password1 !== password2) {
        alert('Passwords do not match');
        return;
    }
    const userData = {
        name,
        email,
        password: password1,
        tlfNumber,
    };

    try {
        const response = await fetch('http://165.227.138.73:4000/registerUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to register user');
        }
        const data = await response.json();
        window.location.href = "/home";
    } catch (error) {
        console.error('Error registering user:', error.message);
        alert(`Error: ${error.message}`);
    }
}



