const logout = async () => {
    try {
        const response = await fetch('http://localhost:5500/api/v1/auth/logout', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            window.location.href = '../frontend/login.html';
        } else {
            console.error('Logout failed:', response.status);
        }
    } catch (error) {
        console.error('An error occurred while logging out:', error);
    }
};

// Wait for the DOM to load before attaching the event listener
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.error('Logout button not found!');
    }
});
