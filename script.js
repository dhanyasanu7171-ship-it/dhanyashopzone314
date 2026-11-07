
// ================================
// SHOPZONE - JAVASCRIPT
// ================================

// Get HTML elements
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const productTotal = document.getElementById("productTotal");
const checkoutButton = document.getElementById("checkoutButton");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

// Store products and cart items
let products = [];
let cart = [];

// Format price in Indian Rupees
function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

// ================================
// FETCH PRODUCTS FROM JSON
// ================================

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Unable to load product data.");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {
        console.error("Error:", error);

        productGrid.innerHTML = `
            <div class="no-products">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Unable to load products</h3>
                <p>Please run the website using a local server.</p>
            </div>
        `;
    }
}

// ================================
// DISPLAY PRODUCT CARDS
// ================================

function displayProducts(productList) {

    productGrid.innerHTML = "";

    productTotal.textContent =
        `${productList.length} Products`;

    if (productList.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products">
                <i class="fa-solid fa-box-open"></i>
                <h3>No products found!</h3>
                <p>Try searching for something else.</p>
            </div>
        `;
        return;
    }

    productList.forEach(product => {

        const card = document.createElement("div");
        card.className = "product-card";

        const rating = Math.max(
            0,
            Math.min(5, Math.round(product.rating))
        );

        const stars =
            "★".repeat(rating) + "☆".repeat(5 - rating);

        card.innerHTML = `
            <div class="product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-number">
                        ${Number(product.rating).toFixed(1)}
                    </span>
                </div>

                <div class="product-bottom">

                    <span class="product-price">
                        ${formatPrice(product.price)}
                    </span>

                    <button
                        class="add-cart"
                        data-id="${product.id}"
                        aria-label="Add ${product.name} to cart"
                        title="Add to Cart"
                    >
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>

                </div>

            </div>
        `;

        productGrid.appendChild(card);

    });
}

// ================================
// SEARCH PRODUCTS
// ================================

function searchProducts() {

    const searchValue = searchInput.value
        .trim()
        .toLowerCase();

    const filteredProducts = products.filter(product => {

        return (
            product.name.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue)
        );

    });

    displayProducts(filteredProducts);
}

searchButton.addEventListener("click", searchProducts);

searchInput.addEventListener("input", searchProducts);

// ================================
// ADD PRODUCTS TO CART
// ================================

productGrid.addEventListener("click", function(event) {

    const button = event.target.closest(".add-cart");

    if (!button) return;

    const productId = Number(button.dataset.id);

    addToCart(productId);

});

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    if (!product) return;

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

    showToast(`${product.name} added to cart!`);
}

// ================================
// UPDATE CART
// ================================

function updateCart() {

    // Calculate total number of items
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    // Calculate total price
    const totalPrice = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    cartTotal.textContent = formatPrice(totalPrice);

    // Display empty cart message
    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Your cart is empty!</h3>
                <p>Start adding your favorite products.</p>
            </div>
        `;

        return;
    }

    // Display cart products
    cartItems.innerHTML = "";

    cart.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        cartItem.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="cart-item-info">

                <h4>${item.name}</h4>

                <p>${formatPrice(item.price)}</p>

                <div class="quantity-controls">

                    <button
                        data-id="${item.id}"
                        data-action="decrease"
                        aria-label="Decrease quantity"
                    >−</button>

                    <span>${item.quantity}</span>

                    <button
                        data-id="${item.id}"
                        data-action="increase"
                        aria-label="Increase quantity"
                    >+</button>

                </div>

            </div>

            <button
                class="remove-item"
                data-id="${item.id}"
                aria-label="Remove ${item.name}"
                title="Remove product"
            >
                <i class="fa-solid fa-trash"></i>
            </button>

        `;

        cartItems.appendChild(cartItem);

    });

}

// ================================
// CART QUANTITY AND REMOVE BUTTONS
// ================================

cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const productId = Number(button.dataset.id);

    const action = button.dataset.action;

    if (action === "increase") {

        changeQuantity(productId, 1);

    } else if (action === "decrease") {

        changeQuantity(productId, -1);

    } else if (button.classList.contains("remove-item")) {

        removeFromCart(productId);

    }

});

// Change product quantity
function changeQuantity(productId, change) {

    const item = cart.find(
        product => product.id === productId
    );

    if (!item) return;

    item.quantity += change;

    // Remove item if quantity becomes zero
    if (item.quantity <= 0) {

        cart = cart.filter(
            product => product.id !== productId
        );

    }

    updateCart();
}

// Remove product completely
function removeFromCart(productId) {

    cart = cart.filter(
        item => item.id !== productId
    );

    updateCart();

    showToast("Product removed from cart!");
}

// ================================
// OPEN AND CLOSE CART
// ================================

function openCart() {

    cartSidebar.classList.add("active");
    cartOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}

function hideCart() {

    cartSidebar.classList.remove("active");
    cartOverlay.classList.remove("active");

    document.body.style.overflow = "";
}

cartButton.addEventListener("click", openCart);

closeCart.addEventListener("click", hideCart);

cartOverlay.addEventListener("click", hideCart);

// Close cart using Escape key
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        hideCart();
    }

});

// ================================
// TOAST NOTIFICATION
// ================================

let toastTimer;

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.add("active");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("active");

    }, 2500);

}

// ================================
// CHECKOUT BUTTON
// ================================

checkoutButton.addEventListener("click", function() {

    if (cart.length === 0) {

        showToast("Your cart is empty!");

        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    alert(
        `Thank you for shopping at ShopZone!\n\n` +
        `Total Amount: ${formatPrice(total)}\n\n` +
        `This is a demo checkout. No real payment was processed.`
    );

});

// ================================
// START THE WEBSITE
// ================================

loadProducts();

updateCart();

