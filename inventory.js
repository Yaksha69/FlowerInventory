document.addEventListener('DOMContentLoaded', () => {
    // Sample data array to store inventory items
    let inventory = [
        { ID: '1', product: 'Rose', quantity: 25, price: '00.00' }
    ];

    // Variable to store the index of the product to delete
    let deleteIndex = null;

    // Function to render inventory table
    function renderInventory() {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = ''; // Clear existing table rows

        inventory.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ID}</td>
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-info me-3" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editProduct(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="setDeleteIndex(${index})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to set the index of the product to delete
    window.setDeleteIndex = function(index) {
        deleteIndex = index; // Store the index of the product to delete
    };

    // Function to delete the product
    document.querySelector('#deleteModal .btn-danger').addEventListener('click', () => {
        if (deleteIndex !== null) {
            inventory.splice(deleteIndex, 1); // Remove the item from the array
            deleteIndex = null; // Reset the delete index
            renderInventory(); // Re-render the inventory table
            // Hide the modal
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        }
    });

    // Function to add a new product
    document.querySelector('.btn-success').addEventListener('click', () => {
        const productName = document.getElementById('addProductName').value;
        const productQuantity = document.getElementById('addProductQuantity').value;
        const productPrice = document.getElementById('addProductPrice').value;

        if (productName && productQuantity && productPrice) {
            const newID = inventory.length ? (parseInt(inventory[inventory.length - 1].ID) + 1).toString() : '1'; // Generate new ID
            inventory.push({ ID: newID, product: productName, quantity: parseInt(productQuantity), price: productPrice });
            renderInventory();
            // Clear input fields and close modal
            document.getElementById('addProductName').value = '';
            document.getElementById('addProductQuantity').value = '';
            document.getElementById('addProductPrice').value = '';
            bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
        }
    });

    // Function to edit an existing product
    window.editProduct = function(index) {
        const item = inventory[index];
        document.getElementById('editProductName').value = item.product;
        document.getElementById('editProductQuantity').value = item.quantity;
        document.getElementById('editProductPrice').value = item.price;

        // Save changes on modal button click
        document.querySelector('#editModal .btn-primary').onclick = () => {
            item.product = document.getElementById('editProductName').value;
            item.quantity = parseInt(document.getElementById('editProductQuantity').value);
            item.price = document.getElementById('editProductPrice').value;
            renderInventory();
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        };
    };

    // Initial render of the inventory table
    renderInventory();
});
