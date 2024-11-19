document.addEventListener('DOMContentLoaded', () => {
    let inventory = [
        { ID: '1', product: 'Rose', quantity: 25, price: '00.00' }
    ];

    let deleteIndex = null;

    // Function to render inventory table
    function renderInventory() {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = '';

        inventory.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.ID}</td>
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-info me-3 action-btn edit-btn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button>
                    <button class="btn btn-sm btn-danger action-btn delete-btn" data-index="${index}" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        attachEventListeners();
    }

    // Attach event listeners for edit and delete buttons
    function attachEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                editProduct(index);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                setDeleteIndex(index);
            });
        });
    }

    // Function to set the index of the product to delete
    function setDeleteIndex(index) {
        deleteIndex = index;
    }
    
    document.querySelector('#deleteModal .btn-danger').addEventListener('click', () => {
        if (deleteIndex !== null) {
            inventory.splice(deleteIndex, 1);
            deleteIndex = null;
            renderInventory();
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        }
    });
    

    // Function to add a new product
    document.querySelector('#addModal .btn-success').addEventListener('click', () => {
    const productName = document.getElementById('addProductName').value.trim();
    const productQuantity = parseInt(document.getElementById('addProductQuantity').value.trim());
    const productPrice = parseFloat(document.getElementById('addProductPrice').value.trim()).toFixed(2);

    if (productName && productQuantity && !isNaN(productPrice)) {
        const newID = inventory.length ? (parseInt(inventory[inventory.length - 1].ID) + 1).toString() : '1';
        inventory.push({ ID: newID, product: productName, quantity: productQuantity, price: productPrice });

        // Clear fields and close modal
        document.getElementById('addProductName').value = '';
        document.getElementById('addProductQuantity').value = '';
        document.getElementById('addProductPrice').value = '';
        renderInventory();
        bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    } else {
        alert('Please fill in all fields correctly!');
    }
});


    // Function to edit an existing product
    function editProduct(index) {
        const item = inventory[index];
        document.getElementById('editProductName').value = item.product;
        document.getElementById('editProductQuantity').value = item.quantity;
        document.getElementById('editProductPrice').value = item.price;
    
        document.querySelector('#editModal .btn-primary').onclick = () => {
            const updatedName = document.getElementById('editProductName').value.trim();
            const updatedQuantity = parseInt(document.getElementById('editProductQuantity').value.trim());
            const updatedPrice = parseFloat(document.getElementById('editProductPrice').value.trim()).toFixed(2);
    
            if (updatedName && updatedQuantity && !isNaN(updatedPrice)) {
                inventory[index] = {
                    ...item,
                    product: updatedName,
                    quantity: updatedQuantity,
                    price: updatedPrice,
                };
    
                renderInventory();
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            } else {
                alert('Please provide valid input values.');
            }
        };
    }
    

    // Initial render of the inventory table
    renderInventory();
});
