document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:5500/api/v1/data";
    const addProductForm = document.getElementById('addProductForm');
    const searchInput = document.querySelector("input[type='search']");

    // Fetch and populate inventory table
    function fetchInventory(searchQuery = '') {
        fetch(`${apiUrl}/all`)
            .then((response) => response.json())
            .then((data) => {
                // Filter the data based on the search query for product name, price, or quantity
                const filteredData = data.filter((item) => {
                    const query = searchQuery.toLowerCase();
                    const productName = item.Product.toLowerCase();
                    const productPrice = item.Price.toFixed(2).toString();
                    const productQuantity = item.Quantity.toString();

                    // Check if the query matches the product name, price or quantity
                    return productName.includes(query) || productPrice.includes(query) || productQuantity.includes(query);
                });

                const tbody = document.querySelector("table tbody");
                tbody.innerHTML = ""; // Clear existing rows
                filteredData.forEach((item) => {
                    const row = `
                        <tr>
                            <td>${item.Product}</td>
                            <td>${item.Quantity}</td>
                            <td>${item.Price}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary me-3 action-btn" 
                                    data-id="${item.Product}" 
                                    data-quantity="${item.Quantity}" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#addQuantityModal">
                                    Add Quantity
                                </button>
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

                // Attach event listeners
                document.querySelectorAll(".btn-secondary").forEach((button) => {
                    button.addEventListener("click", handleAddQuantityButton);
                });

                document.querySelectorAll(".btn-info").forEach((button) => {
                    button.addEventListener("click", handleEditButton);
                });

                document.querySelectorAll(".btn-danger").forEach((button) => {
                    button.addEventListener("click", handleDeleteButton);
                });
            })
            .catch((error) => console.error("Error fetching inventory:", error));
    }

    // Handle Add Quantity button click
    function handleAddQuantityButton(event) {
        const button = event.target;
        const product = button.getAttribute("data-id");

        // Set the product name in the modal (for context)
        document.querySelector("#addQuantityProductName").textContent = product;

        // Remove any previously attached click events to avoid duplication
        const saveButton = document.querySelector("#addQuantityModal .btn-primary");
        saveButton.onclick = () => handleSaveAddQuantity(product); // Attach the correct handler
    }

    // Handle Save Add Quantity
    function handleSaveAddQuantity(product) {
        const quantityToAdd = parseInt(document.querySelector("#addQuantityInput").value, 10);
        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'Please enter a valid quantity.',
            });
            return;
        }

        fetch(`${apiUrl}/increment/${product}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                incrementBy: quantityToAdd,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to update quantity");
                }
                return response.json();
            })
            .then(() => {
                fetchInventory(); // Refresh the inventory table
                const addQuantityModal = bootstrap.Modal.getInstance(document.querySelector("#addQuantityModal"));
                addQuantityModal.hide(); // Close the modal

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Quantity added successfully!',
                });
            })
            .catch((error) => {
                console.error("Error updating quantity:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update quantity. Please try again.',
                });
            });
    }

    // Handle Delete button click
    function handleDeleteButton(event) {
        const product = event.target.getAttribute("data-id");

        Swal.fire({
            title: `Are you sure you want to delete the product "${product}"?`,
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            icon: 'warning',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${apiUrl}/delete/${product}`, {
                    method: "DELETE",
                })
                    .then((response) => response.json())
                    .then((data) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: data.message || "Product deleted successfully!",
                        });
                        fetchInventory(); // Refresh table
                    })
                    .catch((error) => {
                        console.error("Error deleting product:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to delete the product. Please try again.',
                        });
                    });
            }
        });
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

        fetch(`${apiUrl}/edit/${product}`, {
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

                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Product details updated successfully!',
                });
            })
            .catch((error) => {
                console.error("Error updating product:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save changes. Please try again.',
                });
            });
    }

    // Add product functionality
    addProductForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent default form submission behavior
    
        // Get form data
        const productName = document.getElementById('productName').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const productImage = document.getElementById('productImage').files[0];
    
        if (!productName || !quantity || !price || !productImage) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Please fill in all fields.',
            });
            return;
        }
    
        try {
            // Create FormData to send data including the file
            const formData = new FormData();
            formData.append('Product', productName);
            formData.append('Quantity', quantity);
            formData.append('Price', price);
            formData.append('productImage', productImage);
    
            // Send data to backend
            const response = await fetch('http://localhost:5500/api/v1/data/new', {
                method: 'POST',
                body: formData,
            });
    
            const data = await response.json();
    
            if (response.ok && data.message) {
                Swal.fire({
                    icon: 'success',
                    title: 'Product Added',
                    text: 'Your product has been added successfully!',
                    showConfirmButton: true, // Requires user action to close
                    allowOutsideClick: false, // Prevents closing by clicking outside
                }).then(() => {
                    // Close the modal and reset the form after SweetAlert
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addModal'));
                    modal.hide();
                    addProductForm.reset();
                    fetchInventory(); // Refresh inventory after SweetAlert
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'An error occurred while adding the product.',
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while adding the product. Please try again.',
            });
        }
    });
    
    
    


    // Handle search input event for filtering
    searchInput.addEventListener('input', (event) => {
        const searchQuery = event.target.value;
        fetchInventory(searchQuery); // Call fetchInventory with the search query
    });

    // Initial fetch on page load
    fetchInventory();
});
