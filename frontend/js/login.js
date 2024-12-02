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
            Swal.fire({
                imageUrl: "./assets/crying-cat.gif",
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: "Custom image",
                title: 'Login Failed',
                text: errorData.error || 'Invalid username or password.',
            });
            return;
        }

        const data = await response.json();

        // Show a SweetAlert with a custom backdrop
        Swal.fire({
            title: 'Login Successful',
            html: '<div>Redirecting to your dashboard...</div>',
            imageUrl: './assets/flowerload.gif', // Replace with your GIF URL
            imageAlt: 'Loading...',
            backdrop: `
                url("./assets/happy-happy-happy.gif")
                center bottom
                no-repeat
            `,
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
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while logging in. Please try again later.',
        });
    }
});
