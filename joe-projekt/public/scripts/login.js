
async function login() {

    const number = document.getElementById('numberInput').value;
    const password = document.getElementById('passwordInput').value;

    const userData = {
        number,
        password,
    };

    try {
        console.log('Sending login request with:', userData); // Debugging log
        const response = await fetch('/loginUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include', // medtag cookies i request
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from server:', errorData); // Debugging log
            throw new Error(errorData.message || 'Failed to login');
        }

        const data = await response.json();
        alert('Login successful'); 
        
        console.log('Login successful, response data:', data); // Debugging log

        // Redirect to the products page
        window.location.href = "/home";
    } catch (error) {
        console.error('Error logging in:', error.message); // Debugging log
        alert(`Error: ${error.message}`);
    }
}

function logout() {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include', // Medtag cookies i request
    })
        .then(() => {
            alert('You are logged out');
            window.location.href = '/login';
        })
        .catch((error) => {
            console.error('Error logging out:', error);
        });
}
  