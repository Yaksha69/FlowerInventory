document.addEventListener("DOMContentLoaded", function () {
    const productsContainer = document.getElementById('productsContainer');
    const checkoutContent = document.querySelector('.checkoutContent');
    const totalPriceElement = document.getElementById('totalPrice');
    const cartCountDisplay = document.getElementById('cartCount');
    const checkoutButton = document.querySelector('.checkoutbtn');
    const searchInput = document.getElementById('searchInput'); // Get search input field
    let cart = []; // Array to store products in the cart
    let productData = []; // Array to store all loaded product data

    // Function to create a product card
    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="http://localhost:5500/uploads/${product.image}" alt="${product.Product}" class="card-img-top" />
            <div class="card-body">
                <h5 class="card-title">${product.Product}</h5>
                <p class="card-text">Price: ₱${product.Price.toFixed(2)}</p>
                <p class="card-text" id="quantity-${product._id}" style="font-weight: bold;">Quantity: ${product.Quantity}</p>
                <button class="btn btn-primary add-to-cart" data-id="${product._id}">Add to Cart</button>
            </div>
        `;
        productsContainer.appendChild(card);

        // Add event listener to the "Add to Cart" button
        card.querySelector('.add-to-cart').addEventListener('click', () => {
            addToCart(product);
        });
    };

    // Function to add a product to the cart
    const addToCart = (product) => {
        if (product.Quantity <= 0) {
            Swal.fire('Out of Stock!', `No more ${product.Product} available.`, 'warning');
            return;
        }

        const existingProduct = cart.find(item => item._id === product._id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        // Decrement the product's quantity in both the cart and DOM
        product.Quantity -= 1;
        updateProductQuantityInDOM(product._id, product.Quantity);
        updateCart();
        renderCart();
    };

    // Function to update product quantity in the DOM and highlight in red if <= 5
    const updateProductQuantityInDOM = (productId, quantity) => {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        if (quantityElement) {
            quantityElement.textContent = `Quantity: ${quantity}`;
            quantityElement.style.color = quantity <= 5 ? 'red' : 'black'; // Highlight red if <= 5
        }
    };

    // Function to update the cart count display
    const updateCart = () => {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountDisplay.textContent = `Cart: ${cartCount} items`;
    };

    // Function to render the cart items dynamically
    const renderCart = () => {
        checkoutContent.innerHTML = ''; // Clear the existing content
        let total = 0;

        cart.forEach((item) => {
            const itemRow = document.createElement('div');
            itemRow.classList.add('checkoutItem', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-3');
            itemRow.innerHTML = `
                <div class="itemDetails">
                    <p class="m-0 fw-bold">${item.Product}</p>
                    <small>Price: ₱${item.Price.toFixed(2)}</small>
                </div>
                <div class="itemControls d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary quantityBtn decrease" data-id="${item._id}">-</button>
                    <input type="text" class="itemQuantity text-center" value="${item.quantity}" readonly>
                    <button class="btn btn-sm btn-outline-secondary quantityBtn increase" data-id="${item._id}">+</button>
                    <button class="btn btn-sm btn-danger ms-2 deleteBtn" data-id="${item._id}">x</button>
                </div>
            `;
            checkoutContent.appendChild(itemRow);
            total += item.Price * item.quantity;
        });

        totalPriceElement.textContent = total.toFixed(2);
    };

    // Function to update the quantity of an item in the cart
    const updateQuantity = (id, change) => {
        const item = cart.find(cartItem => cartItem._id === id);
        const product = productData.find(product => product._id === id);
        if (item && product) {
            item.quantity += change;
            product.Quantity -= change; // Update quantity of the product
            if (item.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem._id !== id);
            }
        }

        updateCart();
        renderCart();
        updateProductQuantityInDOM(id, product.Quantity); // Update product quantity in DOM
    };

    // Function to remove an item from the cart
    const removeItem = (id) => {
        const item = cart.find(cartItem => cartItem._id === id);
        const product = productData.find(product => product._id === id);
        if (item && product) {
            product.Quantity += item.quantity; // Revert the quantity back
            updateProductQuantityInDOM(product._id, product.Quantity); // Update DOM quantity
        }
        cart = cart.filter(cartItem => cartItem._id !== id); // Remove from cart
        updateCart();
        renderCart();
    };

    // Event delegation for checkout controls
    checkoutContent.addEventListener('click', (event) => {
        const button = event.target;
        const id = button.dataset.id;

        if (button.classList.contains('decrease')) {
            updateQuantity(id, -1);
        } else if (button.classList.contains('increase')) {
            updateQuantity(id, 1);
        } else if (button.classList.contains('deleteBtn')) {
            removeItem(id);
        }
    });

    // Checkout button logic
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            Swal.fire('Cart is empty!', 'Add some products to proceed.', 'warning');
        } else {
            const salesData = cart.map(item => ({
                productId: item._id,
                productName: item.Product,
                quantity: item.quantity,
                totalPrice: item.Price * item.quantity,
            }));
    
            // Send a POST request to save the sale in the database
            fetch('http://localhost:5500/api/v1/sales/addsale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(salesData), // Send the cart data
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Sales recorded successfully') {
                    Swal.fire({
                        title: 'Checkout Successful',
                        text: `Total payment: ₱${totalPriceElement.textContent}`,
                        icon: 'success',
                        confirmButtonText: 'Okay'
                    }).then(() => {
                        // Clear the cart after checkout
                        cart = [];
                        updateCart();
                        renderCart();
                    });
                } else {
                    Swal.fire('Error', 'Failed to save the sale.', 'error');
                }
            })
            .catch(error => {
                console.error('Error during checkout:', error);
                Swal.fire('Error', 'An error occurred during checkout. Please try again.', 'error');
            });
        }
    });

    // Fetch all products and display them
    const loadProductsFromDB = () => {
        fetch('http://localhost:5500/api/v1/data/all')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                productData = products; // Store the product data for reference
                productsContainer.innerHTML = ''; // Clear any existing cards
                products.forEach(product => createProductCard(product));
            })
            .catch(error => {
                console.error('Error fetching products:', error.message);
                alert('Failed to load products.');
            });
    };

    // Filter products based on the search input
// Filter products based on the search input
const filterProducts = () => {
    const query = searchInput.value.toLowerCase().trim(); // Get the query input
    const queryIsNumber = !isNaN(query) && query !== '';  // Check if query is a number

    // Filter the products
    const filteredProducts = productData.filter(product => {
        // Search by product name, price or quantity based on the query
        const matchesName = product.Product.toLowerCase().includes(query); // Filter by product name
        const matchesPrice = queryIsNumber ? product.Price.toFixed(2).includes(query) : false; // Filter by price if query is a number
        const matchesQuantity = queryIsNumber ? product.Quantity.toString().includes(query) : false; // Filter by quantity if query is a number

        // Return true if any of the conditions match
        return matchesName || matchesPrice || matchesQuantity;
    });

    // Clear the previous cards and display the filtered ones
    productsContainer.innerHTML = '';
    filteredProducts.forEach(product => createProductCard(product));
};

// Event listener for the search input field
searchInput.addEventListener('input', filterProducts);

    

    // Load products on page load
    loadProductsFromDB();
});
