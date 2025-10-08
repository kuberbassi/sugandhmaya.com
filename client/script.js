// client/script.js

document.addEventListener("DOMContentLoaded", () => {
    // This is the main function that runs the whole application
    async function initializeApp() {
        // --- GLOBAL STATE ---
        let products = [];
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // --- UTILITY FUNCTIONS ---
        async function fetchProducts() {
            try {
                // Fetch from your backend API
                const response = await fetch('http://localhost:5000/api/products');
                if (!response.ok) throw new Error('Network response was not ok');
                products = await response.json();
            } catch (error) {
                console.error("Could not fetch products:", error);
            }
        }

        function saveCart() {
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // NEW: Function to display a custom toast notification
        function showToast(message) {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                console.error('Toast container not found!');
                alert(message); // Fallback to alert
                return;
            }

            const toast = document.createElement('div');
            toast.className = 'toast-message fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg opacity-0 transition-opacity duration-300 z-50';
            toast.textContent = message;
            toastContainer.appendChild(toast);

            // Animate in and out
            setTimeout(() => {
                toast.classList.add('opacity-100');
            }, 100);
            setTimeout(() => {
                toast.classList.remove('opacity-100');
                toast.classList.add('opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- ELEMENT GRABBERS ---
        const header = document.getElementById("main-header");
        const openCartBtn = document.getElementById("open-cart-button");
        const closeCartBtn = document.getElementById("close-cart-button");
        const cartModal = document.getElementById("cart-modal");
        const cartPanel = document.getElementById("cart-panel");
        const cartItemsContainer = document.getElementById("cart-items");
        const cartCounter = document.getElementById("cart-counter");
        const cartSubtotalEl = document.getElementById("cart-subtotal");
        const emptyCartMessage = document.getElementById("empty-cart-message")?.cloneNode(true);
        const checkoutBtn = document.getElementById("checkout-button");
        const checkoutForm = document.getElementById('checkout-form');

        // --- UI FUNCTIONS ---
        function openCart() {
            if (!cartModal) return;
            cartModal.classList.remove("hidden");
            setTimeout(() => {
                cartModal.classList.remove("opacity-0");
                if (cartPanel) cartPanel.classList.remove("translate-x-full");
            }, 10);
        }

        function closeCart() {
            if (!cartModal) return;
            cartModal.classList.add("opacity-0");
            if (cartPanel) cartPanel.classList.add("translate-x-full");
            setTimeout(() => cartModal.classList.add("hidden"), 500);
        }

        function updateCartUI() {
            if (!cartItemsContainer) return;
            cartItemsContainer.innerHTML = "";

            if (cart.length === 0) {
                if (emptyCartMessage) cartItemsContainer.appendChild(emptyCartMessage);
            } else {
                cart.forEach((item) => {
                    const product = products.find(p => p.id === item.id);
                    if (!product) return;
                    const itemEl = document.createElement("div");
                    itemEl.className = "flex items-center gap-4 py-3 border-b border-gray-100";
                    itemEl.innerHTML = `
                        <img src="http://localhost:5000${product.image}" alt="${product.name}" class="w-16 h-20 object-cover rounded">
                        <div class="flex-grow">
                            <h3 class="font-semibold">${product.name}</h3>
                            <p class="text-sm text-gray-500">₹${product.price}</p>
                            <div class="flex items-center mt-2">
                                <button class="quantity-change h-6 w-6 border rounded text-gray-600" data-id="${item.id}" data-change="-1">-</button>
                                <span class="mx-3 text-sm">${item.quantity}</span>
                                <button class="quantity-change h-6 w-6 border rounded text-gray-600" data-id="${item.id}" data-change="1">+</button>
                            </div>
                        </div>
                        <button class="remove-item text-gray-400 hover:text-red-500" data-id="${item.id}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>`;
                    cartItemsContainer.appendChild(itemEl);
                });
            }

            const subtotal = cart.reduce((total, item) => {
                const product = products.find(p => p.id === item.id);
                return total + (product ? product.price * item.quantity : 0);
            }, 0);
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

            if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
            if (cartCounter) cartCounter.textContent = totalItems;
        }

        function setupScrollObserver() {
            const revealElements = document.querySelectorAll(".reveal-on-scroll");
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("is-visible");
                });
            }, { threshold: 0.1 });
            revealElements.forEach((el) => observer.observe(el));
        }

        // --- PAGE-SPECIFIC RENDER FUNCTIONS ---

        function renderHomePage() {
            const collectionGrid = document.getElementById("collection-grid");
            if (!collectionGrid) return;

            if (products.length === 0) {
                collectionGrid.innerHTML = '<p class="text-center col-span-full">Could not load products. Is the server running?</p>';
                return;
            }

            collectionGrid.innerHTML = "";
            products.forEach((product, index) => {
                const productSlide = document.createElement('div');
                productSlide.className = "swiper-slide";

                productSlide.innerHTML = `
                    <a href="product.html?id=${product.id}" class="product-card-link group block">
                        <div class="folded-corner"><img src="http://localhost:5000${product.image}" loading="lazy" alt="${product.name}" class="product-image" style="width: 300px;"></div>
                        <div class="pt-8 text-center">
                            <h3 class="text-2xl font-serif">${product.name}</h3>
                            <p class="text-base mt-1">${product.category}</p>
                            <p class="text-lg font-bold font-sans mt-2 text-brand-accent">₹${product.price}</p>
                        </div>
                    </a>`;
                collectionGrid.appendChild(productSlide);
            });

            initSwiper();
        }

        function initSwiper() {
            if (typeof Swiper === 'undefined') return;
            const swiper = new Swiper('.collection-slider', {
                loop: true,
                slidesPerView: 'auto',
                spaceBetween: 40,
                centeredSlides: true,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
            });
        }

        function renderShopPage() {
            const shopGrid = document.getElementById('shop-grid');
            const categoryFilter = document.getElementById('category-filter');
            if (!shopGrid || !categoryFilter) return;

            const categories = [...new Set(products.map(p => p.category))];
            categoryFilter.innerHTML = `
                <label class="filter-label">
                    <input type="radio" name="category" value="all" checked>
                    <span>All Products</span>
                </label>
            `;
            categories.forEach(category => {
                categoryFilter.innerHTML += `
                    <label class="filter-label">
                        <input type="radio" name="category" value="${category}">
                        <span>${category}</span>
                    </label>
                `;
            });

            function displayProducts(filter) {
                shopGrid.innerHTML = '';
                const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);

                if (filteredProducts.length === 0) {
                    shopGrid.innerHTML = `<p class="col-span-full">No products found in this category.</p>`;
                    return;
                }

                filteredProducts.forEach(product => {
                    const productCard = document.createElement('a');
                    productCard.href = `product.html?id=${product.id}`;
                    productCard.className = "product-card-link group block";
                    productCard.innerHTML = `
                        <div class="folded-corner"><img src="http://localhost:5000${product.image}" loading="lazy" alt="${product.name}" class="product-image"></div>
                        <div class="pt-8 text-center">
                            <h3 class="text-2xl font-serif">${product.name}</h3>
                            <p class="text-base mt-1">${product.category}</p>
                            <p class="text-lg font-bold font-sans mt-2 text-brand-accent">₹${product.price}</p>
                        </div>`;
                    shopGrid.appendChild(productCard);
                });
            }

            displayProducts('all');
            categoryFilter.addEventListener('change', e => {
                if (e.target.name === 'category') {
                    displayProducts(e.target.value);
                }
            });
        }

        function renderProductPage() {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            const product = products.find(p => p.id === productId);

            if (product) {
                document.title = `${product.name} - Sugandhmaya`;
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-category').textContent = product.category;
                document.getElementById('product-price').textContent = `₹${product.price}`;
                document.getElementById('product-description').textContent = product.description;
                const mainImageEl = document.getElementById('main-product-image');
                mainImageEl.src = `http://localhost:5000${product.image}`;
                mainImageEl.alt = product.name;

                const thumbnailGrid = document.getElementById('thumbnail-grid');
                thumbnailGrid.innerHTML = '';
                product.thumbnails.forEach((thumbSrc, index) => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = `http://localhost:5000${thumbSrc}`;
                    thumbImg.alt = `Thumbnail ${index + 1}`;
                    thumbImg.className = 'thumbnail-image';
                    if (index === 0) thumbImg.classList.add('active');
                    thumbnailGrid.appendChild(thumbImg);
                });

                // Use event delegation for the thumbnails
                thumbnailGrid.addEventListener('click', (e) => {
                    const clickedThumbnail = e.target.closest('.thumbnail-image');
                    if (!clickedThumbnail) return;

                    mainImageEl.src = clickedThumbnail.src;

                    document.querySelectorAll('.thumbnail-image').forEach(t => t.classList.remove('active'));
                    clickedThumbnail.classList.add('active');
                });

                document.getElementById('add-to-cart-product').dataset.productId = product.id;
            } else if (productId && products.length > 0) {
                document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
            }
        }

        function renderCheckoutPage() {
            const summaryItems = document.getElementById('summary-items');
            if (!summaryItems) return;

            summaryItems.innerHTML = '';
            const summaryTotal = document.getElementById('summary-total');
            let total = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const itemEl = document.createElement('div');
                    itemEl.className = "flex justify-between items-center";
                    itemEl.innerHTML = `
                        <div>
                            <p class="font-semibold">${product.name} <span class="text-sm font-normal">x ${item.quantity}</span></p>
                            <p class="text-sm text-white/60">${product.category}</p>
                        </div>
                        <span>₹${(product.price * item.quantity).toFixed(2)}</span>`;
                    summaryItems.appendChild(itemEl);
                    total += product.price * item.quantity;
                }
            });
            summaryTotal.textContent = `₹${total.toFixed(2)}`;
        }

        function renderConfirmationPage() {
            console.log('Rendering confirmation page...');
            const confirmationDetails = document.getElementById('confirmation-details');
            if (!confirmationDetails) {
                console.error('Confirmation details element not found!');
                return;
            }

            const orderData = JSON.parse(localStorage.getItem('latestOrder'));
            console.log('Order data from localStorage:', orderData);

            if (orderData) {
                confirmationDetails.innerHTML = `
                    <p><strong>Order for:</strong> ${orderData.customer.name}</p>
                    <p><strong>Email:</strong> ${orderData.customer.email}</p>
                    <p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)} (Cash on Delivery)</p>
                `;
            } else {
                console.warn('No order data found in localStorage.');
                confirmationDetails.innerHTML = '<p class="text-gray-500">Order details not found. Please try placing your order again.</p>';
            }

            // Clear localStorage after displaying to prevent old data from showing up on refresh
            localStorage.removeItem('latestOrder');
        }

        function setupFormValidation() {
            const phoneInput = document.getElementById('phone');
            const emailInput = document.getElementById('email');

            phoneInput?.addEventListener('input', () => {
                phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
                if (phoneInput.value.length > 10) {
                    phoneInput.value = phoneInput.value.slice(0, 10);
                }
            });

            emailInput?.addEventListener('blur', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value) && emailInput.value.length > 0) {
                    emailInput.style.borderColor = 'red';
                } else {
                    emailInput.style.borderColor = '';
                }
            });
        }

        // NEW: Function to handle product page quantity buttons
        function setupProductPageListeners() {
            const quantityInput = document.getElementById("quantity-input");
            const decreaseBtn = document.getElementById("decrease-quantity");
            const increaseBtn = document.getElementById("increase-quantity");

            if (quantityInput && decreaseBtn && increaseBtn) {
                decreaseBtn.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });

                increaseBtn.addEventListener('click', () => {
                    let currentValue = parseInt(quantityInput.value);
                    quantityInput.value = currentValue + 1;
                });
            }

            // NEW: Function to set up accordions
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const accordionItem = header.parentElement;
                    const content = header.nextElementSibling;

                    accordionItem.classList.toggle('active');

                    if (accordionItem.classList.contains('active')) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    } else {
                        content.style.maxHeight = '0';
                    }
                });
            });
        }

        // --- EVENT LISTENERS ---
        if (header) {
            window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 50));
        }

        openCartBtn?.addEventListener("click", openCart);
        closeCartBtn?.addEventListener("click", closeCart);
        cartModal?.addEventListener("click", (e) => { if (e.target === cartModal) closeCart(); });

        cartItemsContainer?.addEventListener("click", (e) => {
            const target = e.target.closest("button");
            if (!target) return;
            const itemId = target.dataset.id;
            const itemInCart = cart.find(i => i.id === itemId);
            if (!itemInCart) return;

            if (target.classList.contains("quantity-change")) {
                itemInCart.quantity += parseInt(target.dataset.change);
                if (itemInCart.quantity <= 0) {
                    cart = cart.filter(i => i.id !== itemId);
                }
            }
            if (target.classList.contains("remove-item")) {
                cart = cart.filter(i => i.id !== itemId);
            }
            saveCart();
            updateCartUI();
            if (document.querySelector(".checkout-page")) renderCheckoutPage(); // Update checkout summary
        });

        checkoutBtn?.addEventListener("click", () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast("Your cart is empty.");
            }
        });

        document.getElementById('add-to-cart-product')?.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            if (!productId) return;
            const quantity = parseInt(document.getElementById("quantity-input").value);
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ id: productId, quantity: quantity });
            }
            saveCart();
            updateCartUI();
            openCart();
            showToast(`${quantity} item(s) added to cart.`);
        });

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitButton = e.target.querySelector('button[type="submit"]');
                const buttonText = submitButton.querySelector('span');

                submitButton.disabled = true;
                buttonText.textContent = 'Placing Order...';

                const formData = new FormData(e.target);
                const customerDetails = Object.fromEntries(formData.entries());

                const total = cart.reduce((total, item) => {
                    const product = products.find(p => p.id === item.id);
                    return total + (product ? product.price * item.quantity : 0);
                }, 0);

                const detailedCartItems = cart.map(item => {
                    const productDetails = products.find(p => p.id === item.id);
                    return { ...item, name: productDetails.name, price: productDetails.price };
                });

                const orderData = { customer: customerDetails, items: detailedCartItems, total: total };

                try {
                    const response = await fetch('http://localhost:5000/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    if (response.ok) {
                        localStorage.setItem('latestOrder', JSON.stringify(orderData));
                        cart = [];
                        saveCart();
                        window.location.href = 'confirmation.html';
                    } else {
                        const result = await response.json();
                        showToast(`There was a problem: ${result.message}`);
                        submitButton.disabled = false;
                        buttonText.textContent = 'Place Order';
                    }
                } catch (error) {
                    console.error('Error submitting order:', error);
                    showToast('An unexpected error occurred. Please make sure the server is running and try again.');
                    submitButton.disabled = false;
                    buttonText.textContent = 'Place Order';
                }
            });
        }

        // --- INITIALIZE APP ---
        await fetchProducts();

        // Determine which page we are on and render its specific content
        if (document.body.classList.contains("shop-page")) renderShopPage();
        else if (document.getElementById("collection-grid")) renderHomePage();

        if (document.querySelector(".product-page-main")) renderProductPage();
        if (document.body.classList.contains("checkout-page")) renderCheckoutPage();
        if (document.getElementById('confirmation-details')) renderConfirmationPage();

        // NEW: Call the function to set up product page listeners
        setupProductPageListeners();

        // Update UI components that are on every page
        updateCartUI();

        // Set up animations and form validation
        setupScrollObserver();
        setupFormValidation();
    }

    initializeApp();
});