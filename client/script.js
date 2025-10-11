// client/script.js

// --- 1. CONFIGURATION & STATE ---
const config = {
    apiBaseUrl: 'http://localhost:5000',
    storageKeys: { cart: 'cart', latestOrder: 'latestOrder' },
    headerPath: './_header.html',
    footerPath: './_footer.html'
};
const state = { products: [], cart: JSON.parse(localStorage.getItem(config.storageKeys.cart)) || [] };

// --- 2. HTML COMPONENT LOADING UTILITIES ---
async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);
    if (container) {
        try {
            const response = await fetch(filePath);
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) { console.error(`Failed to load component from ${filePath}:`, error); }
    }
}

async function loadHeader() { await loadComponent('header-container', config.headerPath); }
async function loadFooter() { await loadComponent('footer-container', config.footerPath); }

// --- 3. CORE UTILITY FUNCTIONS ---
const utils = {
    async fetchProducts() {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/products`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.products = await response.json();
        } catch (error) {
            console.error("❌ Could not fetch products:", error);
        }
    },
    // Persist cart and immediately refresh UI & checkout summary
    saveCart() {
        localStorage.setItem(config.storageKeys.cart, JSON.stringify(state.cart));
        this.updateCartUI();
    },

    updateCartUI() {
        const totalCount = state.cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        const totalAmount = state.cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0);

        // Update cart count badge
        document.querySelectorAll('[data-cart-count]').forEach(el => {
            el.textContent = totalCount;
            el.style.display = totalCount ? 'flex' : 'none';
        });

        // Update cart panel
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        if (state.cart.length === 0) {
            cartItems.innerHTML = '<div class="p-8 text-center text-gray-500">Your cart is empty</div>';
            return;
        }

        cartItems.innerHTML = `
            <div class="flex-1 overflow-auto px-4">
                ${state.cart.map(item => `
                    <div class="cart-item py-4 border-b border-gray-100">
                        <div class="flex justify-between mb-2">
                            <div>
                                <h4 class="font-medium">${item.productName}</h4>
                                <div class="text-sm text-gray-500">Size: ${item.size} • Scent: ${item.scent}</div>
                            </div>
                            <button class="cart-remove text-red-500 hover:text-red-700" data-id="${item.cartItemId}">×</button>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center space-x-2">
                                <button class="cart-decrease w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200" data-id="${item.cartItemId}">−</button>
                                <span class="w-8 text-center">${item.quantity}</span>
                                <button class="cart-increase w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200" data-id="${item.cartItemId}">+</button>
                            </div>
                            <div class="text-right">
                                <div class="font-medium">₹${(item.price * item.quantity).toFixed(2)}</div>
                                <div class="text-sm text-gray-500">₹${item.price} each</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="border-t p-4 bg-gray-50">
                <div class="flex justify-between mb-4">
                    <span>Subtotal</span>
                    <span class="font-medium">₹${totalAmount.toFixed(2)}</span>
                </div>
                <a href="/checkout" class="btn w-full text-center">Proceed to Checkout</a>
            </div>
        `;
    },

    showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return alert(message);
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toastContainer.innerHTML = '';
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },
    openCart() {
        document.getElementById('cart-panel')?.classList.add('open');
        document.getElementById('cart-panel-overlay')?.classList.add('is-visible');
        document.body.classList.add('cart-open');
    },

    closeCart() {
        document.getElementById('cart-panel')?.classList.remove('open');
        document.getElementById('cart-panel-overlay')?.classList.remove('is-visible');
        document.body.classList.remove('cart-open');
    },

    setupScrollObserver() {
        const header = document.getElementById('main-header');
        if (!header) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    header.classList.remove('scrolled');
                } else {
                    header.classList.add('scrolled');
                }
            },
            { threshold: [1], rootMargin: '-100px 0px 0px 0px' }
        );

        // Observe the first section or main content
        const firstSection = document.querySelector('main > :first-child');
        if (firstSection) observer.observe(firstSection);

        // Also handle immediate scroll position
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial scroll position
    },

    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    initializeHomePage() {
        this.setupScrollAnimations();

        // Lazy load images
        document.querySelectorAll('[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.onload = () => img.classList.add('loaded');
        });
    }
};

// --- 4. CART ACTIONS ---
const cartActions = {
    add(item) {
        const existing = state.cart.find(c => c.cartItemId === item.cartItemId);
        if (existing) {
            existing.quantity = parseInt(existing.quantity || 0) + parseInt(item.quantity || 1);
        } else {
            const prod = state.products.find(p => p.id === item.productId);
            const variant = prod?.variants.find(v => v.name === item.size);
            state.cart.push({
                ...item,
                quantity: parseInt(item.quantity || 1),
                productName: prod?.name,
                price: variant?.price || 0
            });
        }
        utils.saveCart();
        utils.showToast('Added to cart');
        utils.openCart();
    },

    remove(cartItemId) {
        state.cart = state.cart.filter(c => c.cartItemId !== cartItemId);
        utils.saveCart();
        utils.showToast('Item removed');
    },

    updateQuantity(cartItemId, change) {
        const item = state.cart.find(c => c.cartItemId === cartItemId);
        if (!item) return;

        // Ensure change is exactly +1 or -1
        change = change > 0 ? 1 : -1;
        const newQty = Math.max(1, parseInt(item.quantity) + change);

        if (newQty === parseInt(item.quantity)) return;

        item.quantity = newQty;
        utils.saveCart();
        // Explicitly keep cart open
        const panel = document.getElementById('cart-panel');
        if (panel) {
            panel.classList.add('open');
            utils.updateCartUI();
        }
    }
};


// --- 5. PAGE-SPECIFIC RENDER FUNCTIONS ---
const pages = {
    home() {
        const collectionGrid = document.getElementById("collection-grid");
        if (!collectionGrid || !state.products || state.products.length === 0) return;
        const topProducts = state.products.slice(0, 3);
        collectionGrid.innerHTML = topProducts.map(product => `
            <a href="product.html?id=${product.id}" class="product-card-link group block">
                <div class="product-image-container"><img src="${product.variants[0].images[0]}" loading="lazy" alt="${product.name}" class="product-image"></div>
                <div class="pt-6 text-center">
                    <h3 class="text-xl font-serif">${product.name}</h3>
                    <p class="text-base mt-1 text-gray-500">${product.category}</p>
                    <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
                </div>
            </a>`).join('');
    },
    // In client/script.js, replace the entire pages.shop function with this.
    shop() {
        const shopGrid = document.querySelector('.products-grid');
        const filterButtonsContainer = document.querySelector('.filter-buttons');

        if (!shopGrid || !filterButtonsContainer) return;

        const displayProducts = (filter = 'all') => {
            const filteredProducts = state.products.filter(p => filter === 'all' || p.category.toLowerCase() === filter.toLowerCase());

            if (filteredProducts.length === 0) {
                shopGrid.innerHTML = `
                <div class="empty-state">
                    <h3 class="text-2xl text-gray-500 font-serif">No products found in this category.</h3>
                </div>
            `;
                return;
            }

            shopGrid.innerHTML = filteredProducts.map(product => {
                const firstVariant = product.variants && product.variants[0];
                const imagePath = firstVariant ? firstVariant.images[0] : '';
                const price = firstVariant ? firstVariant.price : 'N/A';
                const name = product.name;
                const category = product.category;

                return `
                <a href="product.html?id=${product.id}" class="product-card-link">
                    <article class="product-card">
                        <div class="product-image-container">
                            <img src="${imagePath}" alt="${name}" class="product-image">
                        </div>
                        <div class="product-details">
                            <h3 class="product-title">${name}</h3>
                            <div class="product-category">${category}</div>
                            <div class="product-price">₹${price}</div>
                        </div>
                    </article>
                </a>
            `;
            }).join('');
        };

        filterButtonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-button');
            if (button) {
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const category = button.dataset.category;
                displayProducts(category);
            }
        });

        const setupShopPage = async () => {
            await utils.fetchProducts();
            const categories = [...new Set(state.products.map(p => p.category))];

            const filterButtonsHtml = `
            <button class="filter-button active" data-category="all">All Products</button>
            ${categories.map(category => `
                <button class="filter-button" data-category="${category}">${category}</button>
            `).join('')}
        `;
            filterButtonsContainer.innerHTML = filterButtonsHtml;

            displayProducts();
        };

        setupShopPage();
    },

    // START OF EDITED SECTION: PRODUCT PAGE FUNCTION
    product() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = state.products.find(p => p.id === productId);
        if (!product) {
            document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
            return;
        }

        // --- DOM Elements ---
        const productNameEl = document.getElementById('product-name');
        const breadcrumbEl = document.getElementById('product-name-breadcrumb');
        const categoryEl = document.getElementById('product-category');
        const descriptionEl = document.getElementById('product-description');
        const priceEl = document.getElementById('product-price');
        const productForm = document.getElementById('product-form');
        const galleryContainer = document.querySelector('.product-gallery');

        // --- State ---
        let selectedVariant = product.variants[0];
        let currentImageIndex = 0;

        // --- UI Update Functions ---
        const updateMainImage = (index) => {
            const images = selectedVariant.images;
            if (index < 0 || index >= images.length) return;

            const newImageSrc = images[index];
            document.getElementById('main-product-image').src = newImageSrc;

            const thumbnailImages = document.querySelectorAll('.thumbnail-image');
            thumbnailImages.forEach((img, i) => img.classList.toggle('active', i === index));
            currentImageIndex = index;
        };

        const updateVariantUI = (variant) => {
            priceEl.textContent = `₹${variant.price}`;
            const thumbnailGrid = document.getElementById('thumbnail-grid');
            if (thumbnailGrid) {
                thumbnailGrid.innerHTML = variant.images.map(image =>
                    `<img src="${image}" class="thumbnail-image" data-src="${image}" alt="Product thumbnail">`
                ).join('');
            }
            updateMainImage(0); // Set the first image for the new variant
        };

        const renderOptions = (containerId, options, label, name) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.classList.toggle('hidden', options.length <= 1);
            if (options.length <= 1) return;

            let html = `<label class="subheading mb-3">${label}</label><div class="flex flex-wrap gap-3">`;
            options.forEach((opt, index) => {
                html += `
                <label>
                    <input type="radio" name="${name}" value="${opt}" ${index === 0 ? 'checked' : ''}>
                    <span class="size-box cursor-pointer p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors duration-200">${opt}</span>
                </label>`;
            });
            html += '</div>';
            container.innerHTML = html;
        };

        // --- Initial Page Setup ---
        productNameEl.textContent = product.name;
        breadcrumbEl.textContent = product.name;
        categoryEl.textContent = product.category;
        descriptionEl.textContent = product.description;
        renderOptions('scent-options', product.scents, 'Scent', 'scent');
        renderOptions('size-options', product.variants.map(v => v.name), 'Size', 'size');
        updateVariantUI(selectedVariant);

        // --- Event Listeners ---

        // Listener for the GALLERY (thumbnails and arrows)
        if (galleryContainer) {
            galleryContainer.addEventListener('click', e => {
                // Handle thumbnail clicks
                const thumbnail = e.target.closest('.thumbnail-image');
                if (thumbnail) {
                    const clickedIndex = Array.from(galleryContainer.querySelectorAll('.thumbnail-image')).indexOf(thumbnail);
                    updateMainImage(clickedIndex);
                }

                // Handle arrow clicks
                const images = selectedVariant.images;
                if (e.target.closest('.prev-arrow')) {
                    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                    updateMainImage(newIndex);
                }
                if (e.target.closest('.next-arrow')) {
                    const newIndex = (currentImageIndex + 1) % images.length;
                    updateMainImage(newIndex);
                }
            });
        }

        // Listener for the FORM (variant changes, quantity, add to cart)
        if (productForm) {
            productForm.addEventListener('change', e => {
                if (e.target.name === 'size') {
                    selectedVariant = product.variants.find(v => v.name === e.target.value);
                    if (selectedVariant) updateVariantUI(selectedVariant);
                }
            });

            productForm.addEventListener('click', e => {
                const quantityInput = document.getElementById('quantity-input');
                if (e.target.closest('#decrease-quantity') && parseInt(quantityInput.value) > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                } else if (e.target.closest('#increase-quantity')) {
                    quantityInput.value = parseInt(quantityInput.value) + 1;
                } else if (e.target.closest('#add-to-cart-product')) {
                    const quantity = parseInt(quantityInput.value);
                    const scent = productForm.querySelector('input[name="scent"]:checked')?.value || product.scents[0];
                    const size = productForm.querySelector('input[name="size"]:checked')?.value || product.variants[0].name;
                    const cartItemId = `${product.id}_${size}_${scent}`;
                    cartActions.add({ cartItemId, productId: product.id, size, scent, quantity });
                }
            });
        }

        // Accordion functionality
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                item.classList.toggle('active');
                content.style.maxHeight = item.classList.contains('active') ? content.scrollHeight + 'px' : '0';
            });
        });


        // Image gallery navigation logic
        const prevArrow = document.querySelector('.prev-arrow');
        const nextArrow = document.querySelector('.next-arrow');

        if (prevArrow && nextArrow) {
            prevArrow.addEventListener('click', () => {
                // Use the currently selected variant's images
                const images = selectedVariant.images;
                const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                updateMainImage(newIndex);
            });

            nextArrow.addEventListener('click', () => {
                // Use the currently selected variant's images
                const images = selectedVariant.images;
                const newIndex = (currentImageIndex + 1) % images.length;
                updateMainImage(newIndex);
            });
        }

        // Thumbnail scroller functionality (existing code)
        const thumbnailTrackContainer = document.getElementById('thumbnail-track-container');
        const scrollLeftBtn = document.getElementById('scroll-left');
        const scrollRightBtn = document.getElementById('scroll-right');

        if (thumbnailTrackContainer && scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                thumbnailTrackContainer.scrollBy({
                    left: -100, // Adjust this value to change scroll speed
                    behavior: 'smooth'
                });
            });

            scrollRightBtn.addEventListener('click', () => {
                thumbnailTrackContainer.scrollBy({
                    left: 100, // Adjust this value to change scroll speed
                    behavior: 'smooth'
                });
            });
        }
    },
    // END OF EDITED SECTION: PRODUCT PAGE FUNCTION
    checkout() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Initialize country/state dropdowns with phone input style
        const countrySelect = document.getElementById('country-select');
        const stateSelect = document.getElementById('state-select');

        if (countrySelect) {
            countrySelect.className = 'form-select iti__country-select';
            stateSelect.className = 'form-select iti__country-select';

            // Populate countries
            const countries = window.intlTelInputGlobals.getCountryData();
            countrySelect.innerHTML = countries.map(country =>
                `<option value="${country.iso2}" data-code="${country.dialCode}">
                    ${country.name}
                </option>`
            ).join('');
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const email = formData.get('email');

            // Send OTP first
            const otpSent = await orderSystem.sendOTP(email);
            if (!otpSent) return;

            // Show OTP modal
            const otpModal = document.getElementById('otp-modal');
            otpModal.style.display = 'flex';

            // Handle OTP verification
            document.getElementById('verify-otp-button').onclick = async () => {
                const otp = document.getElementById('otp-input').value;
                const verified = await orderSystem.verifyOTP(email, otp);

                if (verified) {
                    const orderData = {
                        items: state.cart,
                        customer: Object.fromEntries(formData),
                        total: state.cart.reduce((sum, item) =>
                            sum + (item.price * item.quantity), 0)
                    };
                    await orderSystem.placeOrder(orderData);
                }
            };
        });
    },

    confirmation() {
        const order = JSON.parse(localStorage.getItem(config.storageKeys.latestOrder));
        if (!order) {
            window.location.href = '/';
            return;
        }

        const container = document.getElementById('confirmation-details');
        if (!container) return;

        container.innerHTML = `
            <div class="order-receipt p-6 bg-white rounded-lg shadow-lg">
                <h2 class="text-2xl font-medium mb-4">Order #${order.id}</h2>
                <div class="mb-4">
                    <p>Thank you for your order! A confirmation email has been sent to ${order.customer.email}</p>
                </div>
                <div class="order-items border-t border-b py-4 my-4">
                    ${order.items.map(item => `
                        <div class="flex justify-between py-2">
                            <div>
                                ${item.productName} × ${item.quantity}
                                <div class="text-sm text-gray-500">
                                    Size: ${item.size} • Scent: ${item.scent}
                                </div>
                            </div>
                            <div>₹${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-right text-xl font-medium">
                    Total: ₹${order.total.toFixed(2)}
                </div>
                <button onclick="window.print()" class="btn mt-6">
                    Print Receipt
                </button>
            </div>
        `;
    }
};

const orderSystem = {
    async sendOTP(email) {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.success) {
                utils.showToast('OTP sent to your email');
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            utils.showToast('Failed to send OTP: ' + error.message);
            return false;
        }
    },

    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            if (data.success) {
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            utils.showToast('OTP verification failed: ' + error.message);
            return false;
        }
    },

    async placeOrder(orderData) {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem(config.storageKeys.latestOrder, JSON.stringify(data.order));
                window.location.href = '/confirmation.html';
                return true;
            }
            throw new Error(data.message);
        } catch (error) {
            utils.showToast('Order placement failed: ' + error.message);
            return false;
        }
    },

    async handleCheckout(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');

        // First show OTP modal
        document.getElementById('otp-modal').style.display = 'flex';

        // Handle send OTP button
        document.getElementById('send-otp-button').onclick = async () => {
            const sent = await this.sendOTP(email);
            if (sent) {
                utils.showToast('OTP sent to your email');
            }
        };

        // Handle verify OTP button
        document.getElementById('verify-otp-button').onclick = async () => {
            const otp = document.getElementById('otp-input').value;
            const verified = await this.verifyOTP(email, otp);

            if (verified) {
                const orderData = {
                    items: state.cart,
                    customer: Object.fromEntries(formData),
                    total: state.cart.reduce((sum, item) =>
                        sum + (parseFloat(item.price) * parseInt(item.quantity)), 0)
                };
                await this.placeOrder(orderData);
            }
        };
    }
};

// --- 6. INITIALIZATION & EVENT LISTENERS ---
async function initializeApp() {
    await Promise.all([loadHeader(), loadFooter()]);
    await utils.fetchProducts();

    setupGlobalListeners();

    const body = document.body;
    if (body.classList.contains("home-page")) pages.home();
    if (body.classList.contains("shop-page")) pages.shop();
    if (body.querySelector(".product-page-main")) pages.product();
    if (body.classList.contains("checkout-page")) pages.checkout();
    if (body.querySelector("#confirmation-details")) pages.confirmation();

    // Initial UI updates after everything is loaded
    utils.updateCartUI();
    utils.setupScrollObserver();
}

function setupGlobalListeners() {
    // Cart panel controls
    document.getElementById('open-cart-button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        utils.openCart();
    });

    document.getElementById('close-cart-button')?.addEventListener('click', utils.closeCart);

    // Cart item controls delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.cart-decrease')) {
            const id = e.target.closest('.cart-decrease').dataset.id;
            cartActions.updateQuantity(id, -1);
        }
        if (e.target.closest('.cart-increase')) {
            const id = e.target.closest('.cart-increase').dataset.id;
            cartActions.updateQuantity(id, 1);
        }
        if (e.target.closest('.cart-remove')) {
            const id = e.target.closest('.cart-remove').dataset.id;
            cartActions.remove(id);
        }
    });

    // In the setupGlobalListeners function, REPLACE the event listener with this:
    document.addEventListener('click', (e) => {
        // Handle cart item controls
        if (e.target.closest('.cart-decrease')) {
            e.stopPropagation(); // Prevents panel from closing
            const id = e.target.closest('.cart-decrease').dataset.id;
            cartActions.updateQuantity(id, -1);
        }
        if (e.target.closest('.cart-increase')) {
            e.stopPropagation(); // Prevents panel from closing
            const id = e.target.closest('.cart-increase').dataset.id;
            cartActions.updateQuantity(id, 1);
        }
        if (e.target.closest('.cart-remove')) {
            e.stopPropagation(); // Prevents panel from closing
            const id = e.target.closest('.cart-remove').dataset.id;
            cartActions.remove(id);
        }

        // Handle closing cart when clicking outside
        const cartPanel = document.getElementById('cart-panel');
        const cartButton = document.getElementById('open-cart-button');
        if (cartPanel?.classList.contains('open') &&
            !cartPanel.contains(e.target) &&
            !cartButton?.contains(e.target)) {
            utils.closeCart();
        }
    });

    // Update header on scroll
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });
}

function initializeLocationDropdowns() {
    const countrySelect = document.getElementById('country-select');
    const stateSelect = document.getElementById('state-select');

    if (!countrySelect || !stateSelect) return;

    // Style dropdowns
    [countrySelect, stateSelect].forEach(select => {
        select.className = 'form-select';
    });

    // Load country data
    fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries%2Bstates.json')
        .then(response => response.json())
        .then(data => {
            // Populate countries
            countrySelect.innerHTML = `
                <option value="">Select Country</option>
                ${data.countries.map(country =>
                `<option value="${country.iso2}">${country.name}</option>`
            ).join('')}
            `;

            // Handle country change
            countrySelect.addEventListener('change', function () {
                const country = data.countries.find(c => c.iso2 === this.value);
                if (!country) {
                    stateSelect.innerHTML = '<option value="">Select State</option>';
                    stateSelect.disabled = true;
                    return;
                }

                stateSelect.innerHTML = `
                    <option value="">Select State</option>
                    ${country.states.map(state =>
                    `<option value="${state.state_code}">${state.name}</option>`
                ).join('')}
                `;
                stateSelect.disabled = false;
            });
        });
}

// end of setupGlobalListeners
initializeApp();

// Add to your initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Force show any hidden content after a slight delay
    setTimeout(() => {
        document.querySelectorAll('.reveal-on-scroll, .hero-title, .main-content-area, #collection-grid')
            .forEach(el => {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
                el.style.transform = 'none';
            });
    }, 100);
});

// Update header transparency
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(248, 244, 238, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter = 'none';
    }
}, { passive: true });