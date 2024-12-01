// Create a SweetAlert mixin for common configuration
const swalMixin = Swal.mixin({
    toast: true,
    position: 'top-end',
    iconColor: 'white',
    customClass: {
        popup: 'colored-toast'
    },
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form from refreshing the page

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5500/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include', // Ensure cookies are included
        });

        if (!response.ok) {
            const errorData = await response.json();
            swalMixin.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorData.error || 'Invalid username or password.',
            });
            return;
        }

        const data = await response.json();

        // Show a loading GIF as part of the success notification
        Swal.fire({
            title: 'Login Successful',
            html: '<div>Redirecting to your dashboard...</div>',
            imageUrl: './assets/flowerload.gif', // Replace with your GIF URL
            imageAlt: 'Loading...',
            allowOutsideClick: false,
            showConfirmButton: false,
            timerProgressBar: true,
        });

        // Delay the redirection slightly to allow the GIF to display
        setTimeout(() => {
            // Save the JWT token or redirect to the dashboard
            document.cookie = `jwt=${data.token}; path=/;`;
            window.location.href = '/frontend/htmls/dashboard.html'; // Redirect to dashboard
        }, 3000); // Adjust the delay as needed

    } catch (err) {
        console.error('Error:', err);
        swalMixin.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while logging in. Please try again later.',
        });
    }
});
