document.addEventListener("DOMContentLoaded", function () {
    const salesTableBody = document.getElementById("salesTableBody");
    const paginationContainer = document.querySelector(".pagination");
    const dateInput = document.getElementById("date"); // Get the date input field

    const rowsPerPage = 5; // Limit per page
    let currentPage = 1; // Current page
    let data = []; // To store fetched sales data

    // Initialize the Bootstrap datepicker
    $(dateInput).datepicker({
        format: 'mm/dd/yyyy', // Set date format as 'mm/dd/yyyy'
        autoclose: true, // Close the datepicker when a date is selected
        todayHighlight: true // Highlight today's date
    });

    // Event listener for date selection
    $(dateInput).on('changeDate', function (e) {
        const selectedDate = e.format('mm/dd/yyyy'); // Get the selected date
        filterSalesByDate(selectedDate); // Call the function to filter sales by date
    });

    // Function to render the table data
    function renderTable(page) {
        // Clear the table body before rendering new data
        salesTableBody.innerHTML = '';

        // Calculate the start and end indices for pagination
        const startIndex = (page - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        // Slice the data to show only the relevant items for the current page
        const paginatedData = data.slice(startIndex, endIndex);

        // Render the rows for the current page
        paginatedData.forEach(sale => {
            const saleDate = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A';
            const row = `
                <tr>
                    <td>${saleDate}</td>
                    <td>${sale.Product}</td>
                    <td>${sale.QuantitySold}</td>
                    <td>${sale.Price}</td>
                    <td>${sale.Total}</td>
                </tr>
            `;
            salesTableBody.innerHTML += row;
        });
    }

    // Function to render the pagination
    function renderPagination() {
        const pageCount = Math.ceil(data.length / rowsPerPage); // Calculate the total number of pages

        // Create the pagination buttons
        let paginationHTML = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Previous" data-page="prev">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

        // Add page number buttons
        for (let i = 1; i <= pageCount; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Add the "Next" button
        paginationHTML += `
            <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Next" data-page="next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;

        // Insert pagination HTML into the container
        paginationContainer.innerHTML = paginationHTML;

        // Attach event listeners to the pagination buttons
        const pageLinks = paginationContainer.querySelectorAll(".page-link");
        pageLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault(); // Prevent the default anchor behavior
                const page = link.getAttribute("data-page");

                if (page === "prev") {
                    if (currentPage > 1) currentPage--;
                } else if (page === "next") {
                    if (currentPage < Math.ceil(data.length / rowsPerPage)) currentPage++;
                } else {
                    currentPage = parseInt(page);
                }

                renderTable(currentPage);
                renderPagination();
            });
        });
    }

    // Function to fetch sales data filtered by selected date
    function filterSalesByDate(selectedDate) {
        const formattedDate = new Date(selectedDate);
        const startOfDay = new Date(formattedDate.setHours(0, 0, 0, 0)); // Start of the selected day
        const endOfDay = new Date(formattedDate.setHours(23, 59, 59, 999)); // End of the selected day

        // Format the start and end date to 'YYYY-MM-DD' for the backend
        const startFormatted = startOfDay.toISOString().split('T')[0];  // Get date in 'YYYY-MM-DD' format
        const endFormatted = endOfDay.toISOString().split('T')[0]; // Get date in 'YYYY-MM-DD' format

        // Make API call to fetch sales data based on the selected date range
        fetch(`http://localhost:5500/api/v1/sales/allsales?start=${startFormatted}&end=${endFormatted}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(fetchedData => {
                console.log("Fetched Data:", fetchedData); // Debug fetched data

                if (Array.isArray(fetchedData)) {
                    // Filter sales data based on the selected date
                    data = fetchedData.filter(sale => {
                        const saleDate = new Date(sale.createdAt);
                        return saleDate >= startOfDay && saleDate <= endOfDay;
                    });

                    renderTable(currentPage); // Re-render the table
                    renderPagination(); // Re-render pagination
                } else {
                    console.error("Unexpected data format:", fetchedData);
                }
            })
            .catch(error => console.error("Error fetching sales data:", error));
    }

    // Fetch all sales data when the page loads
// Fetch all sales data when the page loads
fetch("http://localhost:5500/api/v1/sales/allsales")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
    })
    .then(fetchedData => {
        console.log("Fetched Data:", fetchedData); // Debug fetched data

        if (Array.isArray(fetchedData)) {
            // Sort by createdAt (including both date and time)
            data = fetchedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


            // Render the table with the initial sorted data
            renderTable(currentPage);

            // Render pagination after sorting
            renderPagination();
        } else {
            console.error("Unexpected data format:", fetchedData);
        }
    })
    .catch(error => console.error("Error fetching sales data:", error));

});
