document.getElementById('accountForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent form submission

    const currentPassword = document.getElementById('currentPassword').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if new passwords match
    if (password !== confirmPassword) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    // Send password change request to backend
    const response = await fetch('http://localhost:5500/api/v1/auth/change-password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, password }),
        credentials: 'include',  // Include the JWT cookie in the request
    });

    const data = await response.json();

    if (response.ok) {
        alert('Password changed successfully!');
        window.location.href = 'login.html';  // Redirect to login page after successful password change
    } else {
        alert(`Error: ${data.error}`);
    }
});
