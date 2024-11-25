document.addEventListener("DOMContentLoaded", function () {
    const salesTableBody = document.getElementById("salesTableBody");

    // Fetch sales data from the backend
    fetch("http://localhost:5000/api/v1/sales/allsales")
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error! Status: ${response.status}');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            console.log("Fetched Data:", data); // Debug fetched data
            
            // Check if the data is an array
            if (Array.isArray(data)) {
                data.forEach(sale => {
                    const row = `
                        <tr>
                            <td>${new Date(sale.Date).toLocaleDateString()}</td>
                            <td>${sale.Product}</td>
                            <td>${sale.QuantitySold}</td>
                            <td>${sale.Price}</td>
                            <td>${sale.Total}</td>
                        </tr>
                    `;
                    salesTableBody.innerHTML += row; // Append row to the table body
                });
            } else {
                console.error("Unexpected data format:", data);
            }
        })
        .catch(error => console.error("Error fetching sales data:", error));
});