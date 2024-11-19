document.addEventListener("DOMContentLoaded", function () {
    const checkoutContent = document.querySelector(".checkoutContent");
    const totalPriceElement = document.getElementById("totalPrice");

    // Example cart data
    let cart = [
        { name: "Rose", price: 100.0, quantity: 1 },
    ];

    const renderCart = () => {
        checkoutContent.innerHTML = ""; // Clear previous content
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            const itemElement = `
                <div class="checkoutItem d-flex justify-content-between align-items-center mb-3">
                    <div class="itemDetails">
                        <p class="m-0 fw-bold">${item.name}</p>
                        <small>Price: $${item.price.toFixed(2)}</small>
                    </div>
                    <div class="itemControls d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary quantityBtn" data-action="decrease" data-index="${index}">-</button>
                        <input type="text" class="itemQuantity text-center" value="${item.quantity}" readonly>
                        <button class="btn btn-sm btn-outline-secondary quantityBtn" data-action="increase" data-index="${index}">+</button>
                        <button class="btn btn-sm btn-danger ms-2 deleteBtn" data-index="${index}">X</button>
                    </div>
                </div>
            `;
            checkoutContent.insertAdjacentHTML("beforeend", itemElement);
        });

        totalPriceElement.textContent = `$${total.toFixed(2)}`;
    };

    checkoutContent.addEventListener("click", (e) => {
        const index = e.target.dataset.index;

        if (e.target.matches(".quantityBtn")) {
            const action = e.target.dataset.action;
            if (action === "increase") cart[index].quantity++;
            if (action === "decrease" && cart[index].quantity > 1) cart[index].quantity--;
        }

        if (e.target.matches(".deleteBtn")) {
            cart.splice(index, 1);
        }

        renderCart();
    });

    renderCart();
});
