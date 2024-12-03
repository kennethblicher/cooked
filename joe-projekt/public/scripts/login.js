
async function login() {

    const number = document.getElementById('numberInput').value;
    const password = document.getElementById('passwordInput').value;

    const userData = {
        number,
        password,
    };

    try {
        console.log('Sending login request with:', userData); // Debugging log
        const response = await fetch('http://localhost:4000/loginUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from server:', errorData); // Debugging log
            throw new Error(errorData.message || 'Failed to login');
        }

        const data = await response.json();

        sessionStorage.setItem('token', data.token); // Gem token
        console.log('Login successful, response data:', data); // Debugging log

        // Redirect to the products page
        window.location.href = "/products";
    } catch (error) {
        console.error('Error logging in:', error.message); // Debugging log
        alert(`Error: ${error.message}`);
    }
}
console.log("hello")


// logud funktion ift. rydde tokenet
function logout() {
    sessionStorage.removeItem('token');
    alert('You are logged out');
    window.location.href = '/login';
  }
  