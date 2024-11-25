document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:5000/api/v1/data";

    // Fetch and populate inventory table
    function fetchInventory() {
        fetch('${apiUrl}/all')
            .then((response) => response.json())
            .then((data) => {
                const tbody = document.querySelector("table tbody");
                tbody.innerHTML = ""; // Clear existing rows
                data.forEach((item) => {
                    const row = `
                        <tr>
                            <td>${item.Product}</td>
                            <td>${item.Quantity}</td>
                            <td>${item.Price}</td>
                            <td>
                                <button class="btn btn-sm btn-info me-3 action-btn" 
                                    data-id="${item.Product}" 
                                    data-quantity="${item.Quantity}" 
                                    data-price="${item.Price}" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#editModal">
                                    Edit
                                </button>
                                <button class="btn btn-sm btn-danger action-btn" 
                                    data-id="${item.Product}">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });

                // Attach edit and delete event listeners
                document.querySelectorAll(".btn-info").forEach((button) => {
                    button.addEventListener("click", handleEditButton);
                });

                document.querySelectorAll(".btn-danger").forEach((button) => {
                    button.addEventListener("click", handleDeleteButton);
                });
            })
            .catch((error) => console.error("Error fetching inventory:", error));
    }

    // Handle Delete button click
    function handleDeleteButton(event) {
        const product = event.target.getAttribute("data-id");

        if (confirm('Are you sure you want to delete the product "${product}"?')) {
            fetch('${apiUrl}/delete/${product}', {
                method: "DELETE",
            })
                .then((response) => response.json())
                .then((data) => {
                    alert(data.message || "Product deleted successfully!");
                    fetchInventory(); // Refresh table
                })
                .catch((error) => console.error("Error deleting product:", error));
        }
    }

    // Handle Edit button click
    function handleEditButton(event) {
        const button = event.target;
        const product = button.getAttribute("data-id");
        const quantity = button.getAttribute("data-quantity");
        const price = button.getAttribute("data-price");
    
        // Populate the edit modal with the current data
        document.querySelector("#editProductName").value = product;
        document.querySelector("#editProductQuantity").value = quantity;
        document.querySelector("#editProductPrice").value = price;
    
        // Remove any previously attached click events to avoid duplication
        const saveButton = document.querySelector("#editModal .btn-primary");
        saveButton.onclick = () => handleSaveEdit(product); // Attach the correct handler
    }
    

    // Handle Save Edit
    function handleSaveEdit(product) {
        const updatedQuantity = document.querySelector("#editProductQuantity").value;
        const updatedPrice = document.querySelector("#editProductPrice").value;
    
        fetch('${apiUrl}/edit/${product}', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Product: product,
                Quantity: parseInt(updatedQuantity, 10),
                Price: parseFloat(updatedPrice),
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update product");
                }
                return response.json();
            })
            .then(() => {
                fetchInventory(); // Refresh the inventory table
                const editModal = bootstrap.Modal.getInstance(document.querySelector("#editModal"));
                editModal.hide(); // Close the modal
            })
            .catch((error) => {
                console.error("Error updating product:", error);
                alert("Failed to save changes. Please try again.");
            });
    }
    

    // Add product functionality
    document.querySelector("#addProductForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const productName = document.querySelector("#productName").value;
        const quantity = document.querySelector("#quantity").value;
        const price = document.querySelector("#price").value;

        fetch('${apiUrl}/new', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Product: productName,
                Quantity: parseInt(quantity, 10),
                Price: parseFloat(price),
            }),
        })
            .then((response) => response.json())
            .then(() => {
                fetchInventory(); // Refresh table
                const addModal = bootstrap.Modal.getInstance(document.querySelector("#addModal"));
                addModal.hide();
            })
            .catch((error) => console.error("Error adding product:", error));
    });

    // Initial fetch on page load
    fetchInventory();
});