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

        function showToast(message) {
            const toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                console.error('Toast container not found!');
                alert(message);
                return;
            }

            const toast = document.createElement('div');
            toast.className = 'toast-message';
            toast.textContent = message;

            toastContainer.innerHTML = ''; // Clear previous toasts
            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
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
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                cartModal.classList.remove("opacity-0");
                if (cartPanel) cartPanel.classList.remove("translate-x-full");
            }, 10);
        }

        function closeCart() {
            if (!cartModal) return;
            document.body.style.overflow = '';
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
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return;
                    const variant = product.variants.find(v => v.size === item.size);
                    if (!variant) return;
                    const itemEl = document.createElement("div");
                    itemEl.className = "flex items-center gap-4 py-3 border-b border-gray-100";
                    itemEl.innerHTML = `
                        <img src="http://localhost:5000${variant.image}" alt="${product.name}" class="w-16 h-20 object-cover rounded">
                        <div class="flex-grow">
                            <h3 class="font-semibold">${product.name}</h3>
                            <p class="text-sm text-gray-500">${item.scent} / ${item.size}</p>
                            <div class="flex items-center mt-2">
                                <button class="quantity-change h-6 w-6 border rounded text-gray-600" data-id="${item.cartItemId}" data-change="-1">-</button>
                                <span class="mx-3 text-sm">${item.quantity}</span>
                                <button class="quantity-change h-6 w-6 border rounded text-gray-600" data-id="${item.cartItemId}" data-change="1">+</button>
                            </div>
                        </div>
                        <div>
                           <p class="font-semibold">₹${(variant.price * item.quantity).toFixed(2)}</p>
                           <button class="remove-item text-xs text-gray-400 hover:text-red-500 float-right mt-2" data-id="${item.cartItemId}">Remove</button>
                        </div>`;
                    cartItemsContainer.appendChild(itemEl);
                });
            }

            const subtotal = cart.reduce((total, item) => {
                const product = products.find(p => p.id === item.productId);
                const variant = product ? product.variants.find(v => v.size === item.size) : null;
                return total + (variant ? variant.price * item.quantity : 0);
            }, 0);
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
            if (cartCounter) cartCounter.textContent = totalItems;
        }

        function setupScrollObserver() {
            const revealElements = document.querySelectorAll(".reveal-on-scroll");
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
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

            let gridHTML = "";
            const topProducts = products.slice(0, 3);

            topProducts.forEach((product) => {
                const displayImage = product.variants && product.variants.length > 0 ? product.variants[0].image : product.image;
                gridHTML += `
                    <a href="product.html?id=${product.id}" class="product-card-link group block">
                        <div class="product-image-container"><img src="http://localhost:5000${displayImage}" loading="lazy" alt="${product.name}" class="product-image"></div>
                        <div class="pt-6 text-center">
                            <h3 class="text-xl font-serif">${product.name}</h3>
                            <p class="text-base mt-1 text-gray-500">${product.category}</p>
                            <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
                        </div>
                    </a>`;
            });

            collectionGrid.innerHTML = gridHTML;
        }

        function renderShopPage() {
            const shopGrid = document.getElementById('shop-grid');
            const categoryFilter = document.getElementById('category-filter');
            if (!shopGrid || !categoryFilter) return;

            const categories = [...new Set(products.map(p => p.category))];
            categoryFilter.innerHTML = `<label class="filter-label"><input type="radio" name="category" value="all" checked><span>All Products</span></label>`;
            categories.forEach(category => {
                categoryFilter.innerHTML += `<label class="filter-label"><input type="radio" name="category" value="${category}"><span>${category}</span></label>`;
            });

            function displayProducts(filter) {
                shopGrid.innerHTML = '';
                const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);
                if (filteredProducts.length === 0) {
                    shopGrid.innerHTML = `<p class="col-span-full">No products found in this category.</p>`;
                    return;
                }
                filteredProducts.forEach(product => {
                    const displayImage = product.variants && product.variants.length > 0 ? product.variants[0].image : product.image;
                    const productCard = document.createElement('a');
                    productCard.href = `product.html?id=${product.id}`;
                    productCard.className = "product-card-link group block";
                    productCard.innerHTML = `
                        <div class="product-image-container"><img src="http://localhost:5000${displayImage}" loading="lazy" alt="${product.name}" class="product-image"></div>
                        <div class="pt-8 text-center">
                            <h3 class="text-2xl font-serif">${product.name}</h3>
                            <p class="text-base mt-1">${product.category}</p>
                            <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
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

        // --- Replace this entire function ---
        function renderProductPage() {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            if (!productId) return;
            const product = products.find(p => p.id === productId);

            if (!product) {
                if (products.length > 0) {
                    document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
                }
                return;
            }

            let selectedSize = product.variants[0].size;
            let selectedScent = product.scents[0];

            const nameEl = document.getElementById('product-name');
            const categoryEl = document.getElementById('product-category');
            const priceEl = document.getElementById('product-price');
            const descriptionEl = document.getElementById('product-description');
            const mainImageEl = document.getElementById('main-product-image');
            const thumbnailGrid = document.getElementById('thumbnail-grid');
            const scentOptionsContainer = document.getElementById('scent-options');
            const sizeOptionsContainer = document.getElementById('size-options');

            function renderScents() {
                if (!product.scents || product.scents.length <= 1) {
                    scentOptionsContainer.parentElement.style.display = 'none';
                    return;
                }
                let scentHtml = '<label class="block subheading mb-3">Scent</label><div class="flex flex-wrap gap-3">';
                product.scents.forEach((scent, index) => {
                    scentHtml += `<label><input type="radio" name="scent" value="${scent}" ${index === 0 ? 'checked' : ''}><span>${scent}</span></label>`;
                });
                scentHtml += '</div>';
                scentOptionsContainer.innerHTML = scentHtml;
            }

            function renderSizes() {
                let sizeHtml = '<label class="block subheading mb-3">Size</label><div class="flex flex-wrap gap-3">';
                product.variants.forEach((variant, index) => {
                    sizeHtml += `<label><input type="radio" name="size" value="${variant.size}" ${index === 0 ? 'checked' : ''}><span>${variant.size}</span></label>`;
                });
                sizeHtml += '</div>';
                sizeOptionsContainer.innerHTML = sizeHtml;
            }

            function updateVariantUI() {
                const variant = product.variants.find(v => v.size === selectedSize);
                if (!variant) return;

                priceEl.textContent = `₹${variant.price}`;
                mainImageEl.src = `http://localhost:5000${variant.image}`;

                thumbnailGrid.innerHTML = '';
                variant.thumbnails.forEach((thumbSrc) => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = `http://localhost:5000${thumbSrc}`;
                    thumbImg.alt = `Thumbnail for ${variant.size}`;
                    thumbImg.className = 'thumbnail-image';
                    thumbImg.dataset.src = thumbSrc;
                    thumbnailGrid.appendChild(thumbImg);
                });
                updateActiveThumbnail(variant.image);
            }

            function updateActiveThumbnail(src) {
                document.querySelectorAll('.thumbnail-image').forEach(t => {
                    if (t.dataset.src === src) {
                        t.classList.add('active');
                    } else {
                        t.classList.remove('active');
                    }
                });
            }

            document.title = `${product.name} - Sugandhmaya`;
            nameEl.textContent = product.name;
            categoryEl.textContent = product.category;
            descriptionEl.textContent = product.description;
            renderScents();
            renderSizes();
            updateVariantUI();

            sizeOptionsContainer.addEventListener('change', e => {
                if (e.target.name === 'size') {
                    selectedSize = e.target.value;
                    updateVariantUI();
                }
            });
            scentOptionsContainer.addEventListener('change', e => {
                if (e.target.name === 'scent') {
                    selectedScent = e.target.value;
                }
            });
            thumbnailGrid.addEventListener('click', e => {
                const clickedThumbnail = e.target.closest('.thumbnail-image');
                if (!clickedThumbnail || clickedThumbnail.classList.contains('active')) return;
                mainImageEl.style.opacity = '0';
                setTimeout(() => {
                    mainImageEl.src = clickedThumbnail.src;
                    mainImageEl.style.opacity = '1';
                }, 200);
                updateActiveThumbnail(clickedThumbnail.dataset.src);
            });
        }

        
        function renderCheckoutPage() {
            const summaryItems = document.getElementById('summary-items');
            if (!summaryItems) return;

            summaryItems.innerHTML = '';
            const summaryTotal = document.getElementById('summary-total');
            let total = 0;

            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const variant = product ? product.variants.find(v => v.size === item.size) : null;
                if (variant) {
                    const itemEl = document.createElement('div');
                    itemEl.className = "flex justify-between items-center";
                    itemEl.innerHTML = `
                        <div>
                            <p class="font-semibold">${product.name} <span class="text-sm font-normal">x ${item.quantity}</span></p>
                            <p class="text-sm text-gray-500">${item.scent} / ${item.size}</p>
                        </div>
                        <span>₹${(variant.price * item.quantity).toFixed(2)}</span>`;
                    summaryItems.appendChild(itemEl);
                    total += variant.price * item.quantity;
                }
            });
            if (summaryTotal) summaryTotal.textContent = `₹${total.toFixed(2)}`;
        }

        function renderConfirmationPage() {
            const confirmationDetails = document.getElementById('confirmation-details');
            if (!confirmationDetails) return;

            const orderData = JSON.parse(localStorage.getItem('latestOrder'));
            if (orderData) {
                confirmationDetails.innerHTML = `
                    <p><strong>Order for:</strong> ${orderData.customer.name}</p>
                    <p><strong>Email:</strong> ${orderData.customer.email}</p>
                    <p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)} (Cash on Delivery)</p>
                `;
            } else {
                confirmationDetails.innerHTML = '<p>Order details not found.</p>';
            }
            localStorage.removeItem('cart');
            localStorage.removeItem('latestOrder');
        }

        function setupFormValidation() {
            const phoneInput = document.getElementById('phone');
            phoneInput?.addEventListener('input', () => {
                phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 10);
            });
        }

        function setupContactBubbles() {
            const container = document.getElementById('contact-bubbles-container');
            const popover = document.getElementById('contact-popover');
            const popoverContent = document.getElementById('contact-popover-content');
            const popoverTitle = document.getElementById('popover-title');
            const popoverBody = document.getElementById('popover-body');
            const popoverClose = document.getElementById('popover-close');

            if (!container || !popover) return;

            container.addEventListener('click', (e) => {
                const bubble = e.target.closest('.contact-bubble');
                if (bubble) {
                    popoverTitle.textContent = bubble.dataset.title;
                    popoverBody.innerHTML = bubble.dataset.content;
                    popover.classList.add('visible');
                }
            });

            const closePopover = () => {
                popover.classList.remove('visible');
            };

            popover.addEventListener('click', (e) => {
                if (e.target === popover) {
                    closePopover();
                }
            });
            popoverClose.addEventListener('click', closePopover);
        }

        // --- Also, replace this entire function ---
        function setupProductPageListeners() {
            const quantityInput = document.getElementById("quantity-input");
            const decreaseBtn = document.getElementById("decrease-quantity");
            const increaseBtn = document.getElementById("increase-quantity");
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            const scrollLeftBtn = document.getElementById('scroll-left');
            const scrollRightBtn = document.getElementById('scroll-right');
            const thumbnailTrack = document.getElementById('thumbnail-grid');

            decreaseBtn?.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) quantityInput.value = currentValue - 1;
            });

            increaseBtn?.addEventListener('click', () => {
                let currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
            });

            accordionHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const accordionItem = header.parentElement;
                    const content = header.nextElementSibling;
                    const wasActive = accordionItem.classList.contains('active');

                    // Optional: Close other accordions
                    // document.querySelectorAll('.accordion-item').forEach(item => {
                    //     item.classList.remove('active');
                    //     item.querySelector('.accordion-content').style.maxHeight = '0';
                    // });

                    if (!wasActive) {
                        accordionItem.classList.add('active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    } else {
                        accordionItem.classList.remove('active');
                        content.style.maxHeight = '0';
                    }
                });
            });

            const scrollThumbnails = (direction) => {
                if (!thumbnailTrack) return;
                const scrollAmount = 3 * (80 + 12); // 3 thumbnails + gaps
                thumbnailTrack.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
            };

            scrollLeftBtn?.addEventListener('click', () => scrollThumbnails(-1));
            scrollRightBtn?.addEventListener('click', () => scrollThumbnails(1));
        }

        // --- EVENT LISTENERS ---
        if (header) {
            window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 50));
        }

        openCartBtn?.addEventListener("click", openCart);
        closeCartBtn?.addEventListener("click", closeCart);
        cartModal?.addEventListener("click", (e) => { if (e.target === cartModal) closeCart(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && !cartModal.classList.contains('hidden')) closeCart();
        });


        cartItemsContainer?.addEventListener("click", (e) => {
            const target = e.target.closest("button");
            if (!target) return;
            const cartItemId = target.dataset.id;
            const itemInCart = cart.find(i => i.cartItemId === cartItemId);
            if (!itemInCart) return;

            if (target.classList.contains("quantity-change")) {
                itemInCart.quantity += parseInt(target.dataset.change);
                if (itemInCart.quantity <= 0) {
                    cart = cart.filter(i => i.cartItemId !== cartItemId);
                }
            }
            if (target.classList.contains("remove-item")) {
                cart = cart.filter(i => i.cartItemId !== cartItemId);
            }
            saveCart();
            updateCartUI();
            if (document.body.classList.contains("checkout-page")) renderCheckoutPage();
        });

        checkoutBtn?.addEventListener("click", () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            } else {
                showToast("Your cart is empty.");
            }
        });

        document.getElementById('add-to-cart-product')?.addEventListener('click', (e) => {
            const productId = new URLSearchParams(window.location.search).get('id');
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const selectedSize = document.querySelector('input[name="size"]:checked').value;
            const selectedScent = document.querySelector('input[name="scent"]:checked').value;
            const quantity = parseInt(document.getElementById("quantity-input").value);
            const cartItemId = `${productId}_${selectedSize}_${selectedScent}`;

            const existingItem = cart.find(item => item.cartItemId === cartItemId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ cartItemId, productId, size: selectedSize, scent: selectedScent, quantity });
            }
            saveCart();
            updateCartUI();
            showToast(`${quantity} item(s) added to cart.`);
            openCart();
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
                const itemsForBackend = cart.map(item => ({
                    productId: item.productId,
                    size: item.size,
                    scent: item.scent,
                    quantity: item.quantity
                }));
                const orderData = { customer: customerDetails, items: itemsForBackend };

                try {
                    const response = await fetch('http://localhost:5000/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });
                    if (response.ok) {
                        const result = await response.json();
                        const finalOrderData = { customer: customerDetails, total: result.total };
                        localStorage.setItem('latestOrder', JSON.stringify(finalOrderData));
                        window.location.href = 'confirmation.html';
                    } else {
                        const result = await response.json();
                        showToast(`There was a problem: ${result.message}`);
                        submitButton.disabled = false;
                        buttonText.textContent = 'Place Order';
                    }
                } catch (error) {
                    console.error('Error submitting order:', error);
                    showToast('An unexpected error occurred. Please try again.');
                    submitButton.disabled = false;
                    buttonText.textContent = 'Place Order';
                }
            });
        }

        // --- INITIALIZE APP ---
        async function run() {
            await fetchProducts();

            // Run functions based on which page is currently loaded
            if (document.body.classList.contains("shop-page")) renderShopPage();
            else if (document.getElementById("collection-grid")) renderHomePage();

            if (document.querySelector(".product-page-main")) renderProductPage();
            if (document.body.classList.contains("checkout-page")) renderCheckoutPage();
            if (document.getElementById('confirmation-details')) renderConfirmationPage();

            // Run functions that are needed on multiple pages
            setupProductPageListeners();
            setupFormValidation();
            setupContactBubbles();

            // Global UI updates
            updateCartUI();
            setupScrollObserver();
        }

        run();
    }

    initializeApp();
});