// client/script.js (Corrected and Final Version)

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
    saveCart() {
        localStorage.setItem(config.storageKeys.cart, JSON.stringify(state.cart));
        this.updateCartUI();
    },

    updateCartUI() {
        const totalCount = state.cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
        const totalAmount = state.cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * parseInt(item.quantity || 0)), 0);

        document.querySelectorAll('[data-cart-count]').forEach(el => {
            el.textContent = totalCount;
            el.style.display = totalCount > 0 ? 'flex' : 'none';
        });

        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;

        if (state.cart.length === 0) {
            cartItems.innerHTML = '<div class="p-8 text-center text-gray-500">Your cart is empty</div>';
            return;
        }

        cartItems.innerHTML = `
            <div class="flex-1 overflow-auto px-4">
                ${state.cart.map(item => `
                    <div class="cart-item py-4 border-b border-gray-100" data-id="${item.cartItemId}">
                        <div class="flex justify-between mb-2">
                            <div>
                                <h4 class="font-medium">${item.productName}</h4>
                                <div class="text-sm text-gray-500">Size: ${item.size} • Scent: ${item.scent}</div>
                            </div>
                            <button class="cart-remove text-red-500 hover:text-red-700">×</button>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center space-x-2">
                                <button class="cart-decrease w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">−</button>
                                <span class="w-8 text-center">${item.quantity}</span>
                                <button class="cart-increase w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">+</button>
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
                <a href="/checkout.html" class="btn w-full text-center">Proceed to Checkout</a>
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
        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    },

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('is-visible');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
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

        const currentQty = parseInt(item.quantity);
        const newQty = Math.max(1, currentQty + change);

        if (newQty === currentQty) return;

        item.quantity = newQty;
        utils.saveCart();
    }
};

// --- 5. PAGE-SPECIFIC RENDER FUNCTIONS ---
const pages = {
    home() {
        utils.setupScrollAnimations();
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

        // Lazy load images
        document.querySelectorAll('[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.onload = () => img.classList.add('loaded');
        });
    },
    shop() {
        const shopGrid = document.querySelector('.products-grid');
        const filterButtonsContainer = document.querySelector('.filter-buttons');
        if (!shopGrid || !filterButtonsContainer) return;

        const displayProducts = (filter = 'all') => {
            const filteredProducts = state.products.filter(p => filter === 'all' || p.category.toLowerCase() === filter.toLowerCase());
            shopGrid.innerHTML = filteredProducts.length ? filteredProducts.map(product => {
                const firstVariant = product.variants?.[0];
                return `
                <a href="product.html?id=${product.id}" class="product-card-link">
                    <article class="product-card">
                        <div class="product-image-container"><img src="${firstVariant?.images[0] || ''}" alt="${product.name}" class="product-image"></div>
                        <div class="product-details">
                            <h3 class="product-title">${product.name}</h3>
                            <div class="product-category">${product.category}</div>
                            <div class="product-price">₹${firstVariant?.price || 'N/A'}</div>
                        </div>
                    </article>
                </a>`;
            }).join('') : `<div class="col-span-full text-center py-12 text-gray-500"><h3>No products found.</h3></div>`;
        };

        const categories = [...new Set(state.products.map(p => p.category))];
        filterButtonsContainer.innerHTML = `<button class="filter-button active" data-category="all">All Products</button>` +
            categories.map(cat => `<button class="filter-button" data-category="${cat}">${cat}</button>`).join('');

        filterButtonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-button');
            if (button) {
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                displayProducts(button.dataset.category);
            }
        });

        displayProducts();
    },
    product() {
        utils.setupScrollAnimations();
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = state.products.find(p => p.id === productId);
        if (!product) {
            document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
            return;
        }

        const productForm = document.getElementById('product-form');
        const galleryContainer = document.querySelector('.product-gallery');

        // State variables for the gallery
        let selectedVariant = product.variants[0];
        let currentImageIndex = 0;

        // --- Core Gallery Functions ---
        const updateMainImage = (index) => {
            const images = selectedVariant.images;
            if (index < 0 || index >= images.length) return;
            document.getElementById('main-product-image').src = images[index];
            document.querySelectorAll('.thumbnail-image').forEach((img, i) => img.classList.toggle('active', i === index));
            currentImageIndex = index;
        };

        const updateVariantUI = (variant) => {
            document.getElementById('product-price').textContent = `₹${variant.price}`;
            const thumbnailGrid = document.getElementById('thumbnail-grid');
            if (thumbnailGrid) {
                thumbnailGrid.innerHTML = variant.images.map(image => `<img src="${image}" class="thumbnail-image" alt="Product thumbnail">`).join('');
            }
            updateMainImage(0);
        };

        // --- Render Product Options ---
        const renderOptions = (containerId, options, label, name) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.classList.toggle('hidden', options.length <= 1);
            if (options.length <= 1) return;
            container.innerHTML = `<label class="subheading mb-3">${label}</label><div class="flex flex-wrap gap-3">${options.map((opt, index) => `
            <label>
                <input type="radio" name="${name}" value="${opt}" ${index === 0 ? 'checked' : ''} class="sr-only">
                <span class="size-box cursor-pointer p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors duration-200">${opt}</span>
            </label>`).join('')}</div>`;
        };

        // --- Initial Page Setup ---
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-name-breadcrumb').textContent = product.name;
        document.getElementById('product-category').textContent = product.category;
        document.getElementById('product-description').textContent = product.description;
        renderOptions('scent-options', product.scents, 'Scent', 'scent');
        renderOptions('size-options', product.variants.map(v => v.name), 'Size', 'size');
        updateVariantUI(selectedVariant);

        // --- Event Listeners ---

        // Listener for thumbnails
        if (galleryContainer) {
            galleryContainer.addEventListener('click', e => {
                const thumbnail = e.target.closest('.thumbnail-image');
                if (thumbnail) {
                    const clickedIndex = Array.from(galleryContainer.querySelectorAll('.thumbnail-image')).indexOf(thumbnail);
                    updateMainImage(clickedIndex);
                }
            });
        }

        // Listener for arrow navigation
        const prevArrow = document.querySelector('.prev-arrow');
        const nextArrow = document.querySelector('.next-arrow');

        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                const images = selectedVariant.images;
                const newIndex = (currentImageIndex - 1 + images.length) % images.length;
                updateMainImage(newIndex);
            });
        }

        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                const images = selectedVariant.images;
                const newIndex = (currentImageIndex + 1) % images.length;
                updateMainImage(newIndex);
            });
        }

        // Listener for the form (variant changes, quantity, add to cart)
        if (productForm) {
            productForm.addEventListener('change', e => {
                if (e.target.name === 'size') {
                    selectedVariant = product.variants.find(v => v.name === e.target.value);
                    if (selectedVariant) updateVariantUI(selectedVariant);
                }
            });
            productForm.addEventListener('click', e => {
                const quantityInput = document.getElementById('quantity-input');
                if (e.target.closest('#decrease-quantity')) quantityInput.value = Math.max(1, parseInt(quantityInput.value) - 1);
                if (e.target.closest('#increase-quantity')) quantityInput.value = parseInt(quantityInput.value) + 1;
                if (e.target.closest('#add-to-cart-product')) {
                    const quantity = parseInt(quantityInput.value);
                    const scent = productForm.querySelector('input[name="scent"]:checked')?.value || product.scents[0];
                    const size = productForm.querySelector('input[name="size"]:checked')?.value || product.variants[0].name;
                    cartActions.add({ cartItemId: `${product.id}_${size}_${scent}`, productId: product.id, size, scent, quantity });
                }
            });
        }

        // Accordion functionality
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                item.classList.toggle('active');
                content.style.maxHeight = item.classList.contains('active') ? `${content.scrollHeight}px` : '0';
            });
        });

        // Thumbnail scroller functionality
        const thumbnailTrackContainer = document.getElementById('thumbnail-track-container');
        const scrollLeftBtn = document.getElementById('scroll-left');
        const scrollRightBtn = document.getElementById('scroll-right');

        if (thumbnailTrackContainer && scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                thumbnailTrackContainer.scrollBy({
                    left: -100,
                    behavior: 'smooth'
                });
            });

            scrollRightBtn.addEventListener('click', () => {
                thumbnailTrackContainer.scrollBy({
                    left: 100,
                    behavior: 'smooth'
                });
            });
        }
    },
    checkout() {
        const form = document.getElementById('checkout-form');
        const summaryItemsContainer = document.getElementById('summary-items');
        const summaryTotalEl = document.getElementById('summary-total');
        const countrySelect = document.getElementById('country');
        const stateSelect = document.getElementById('state');
        const phoneInput = document.getElementById('phone');
        const otpModal = document.getElementById('otp-modal');
        const placeOrderBtn = document.getElementById('place-order-button');
        let countryData = []; // To store fetched country data

        // 1. Render the Order Summary from localStorage
        const renderCheckoutSummary = () => {
            if (state.cart.length === 0) {
                summaryItemsContainer.innerHTML = '<p class="text-gray-500">Your cart is empty.</p>';
                placeOrderBtn.disabled = true;
                placeOrderBtn.style.opacity = '0.5';
                return;
            }

            const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            summaryItemsContainer.innerHTML = state.cart.map(item => `
                <div class="flex justify-between items-center text-sm">
                    <div>
                        <p class="font-bold">${item.productName}</p>
                        <p class="text-gray-600">${item.size} &times; ${item.quantity}</p>
                    </div>
                    <p class="font-medium">₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `).join('');
            summaryTotalEl.textContent = `₹${total.toFixed(2)}`;
        };

        // 2. Initialize Phone Input with Country Codes
        const iti = window.intlTelInput(phoneInput, {
            initialCountry: "in",
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        });

        // 3. Fetch and Handle Country/State Dropdowns (Reliable Method)
        async function initializeLocations() {
            try {
                const response = await fetch('https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries%2Bstates.json');
                countryData = await response.json();

                countrySelect.innerHTML = '<option value="">Select Country</option>' +
                    countryData.map(c => `<option value="${c.iso2}">${c.name}</option>`).join('');

                countrySelect.value = 'IN'; // Default to India
                countrySelect.dispatchEvent(new Event('change'));
            } catch (error) {
                console.error("Failed to load country data:", error);
            }
        }

        countrySelect.addEventListener('change', () => {
            const selectedCountry = countryData.find(c => c.iso2 === countrySelect.value);
            if (selectedCountry && selectedCountry.states.length > 0) {
                stateSelect.innerHTML = '<option value="">Select State</option>' +
                    selectedCountry.states.map(s => `<option value="${s.state_code}">${s.name}</option>`).join('');
                stateSelect.disabled = false;
            } else {
                stateSelect.innerHTML = '<option value="">No states available</option>';
                stateSelect.disabled = true;
            }
        });

        // 4. Handle the Order Submission and OTP Flow
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                utils.showToast("Please fill all required fields.");
                return;
            }
            const formData = new FormData(form);
            const customerData = Object.fromEntries(formData);
            customerData.phone = iti.getNumber();

            const otpSent = await orderSystem.sendOTP(customerData.email);
            if (otpSent) {
                otpModal.style.display = 'flex';
            }

            document.getElementById('verify-otp-button').onclick = async () => {
                const otp = document.getElementById('otp-input').value;
                const verified = await orderSystem.verifyOTP(customerData.email, otp);
                if (verified) {
                    await orderSystem.placeOrder({ customer: customerData, items: state.cart });
                }
            };
        });

        document.getElementById('cancel-otp-button').addEventListener('click', () => {
            otpModal.style.display = 'none';
        });

        // Initial render
        renderCheckoutSummary();
        initializeLocations();
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

        document.getElementById('otp-modal').style.display = 'flex';

        document.getElementById('send-otp-button').onclick = async () => {
            const sent = await this.sendOTP(email);
            if (sent) {
                utils.showToast('OTP sent to your email');
            }
        };

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

    if (document.body.classList.contains("home-page")) pages.home();
    if (document.body.classList.contains("shop-page")) pages.shop();
    if (document.querySelector(".product-page-main")) pages.product();
    if (document.body.classList.contains("checkout-page")) pages.checkout();
    if (document.querySelector("#confirmation-details")) pages.confirmation();

    utils.updateCartUI();
    utils.setupScrollObserver();

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            document.querySelectorAll('.reveal-on-scroll, .hero-title, .main-content-area, #collection-grid')
                .forEach(el => {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                    el.style.transform = 'none';
                });
        }, 100);
    });

    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(248, 244, 238, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = 'transparent';
                header.style.backdropFilter = 'none';
            }
        }
    }, { passive: true });
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        const openCartButton = e.target.closest('#open-cart-button');
        const closeCartButton = e.target.closest('#close-cart-button');
        const cartItemAction = e.target.closest('.cart-item button');
        const cartPanel = document.getElementById('cart-panel');

        if (openCartButton) {
            e.stopPropagation();
            utils.openCart();
            return;
        }

        if (closeCartButton) {
            utils.closeCart();
            return;
        }

        if (cartItemAction) {
            e.stopPropagation();
            const cartItem = cartItemAction.closest('.cart-item');
            const id = cartItem.dataset.id;

            if (cartItemAction.matches('.cart-increase')) {
                cartActions.updateQuantity(id, 1);
            } else if (cartItemAction.matches('.cart-decrease')) {
                cartActions.updateQuantity(id, -1);
            } else if (cartItemAction.matches('.cart-remove')) {
                cartActions.remove(id);
            }
            return;
        }

        if (cartPanel && cartPanel.classList.contains('open') &&
            !cartPanel.contains(e.target) && !document.getElementById('open-cart-button').contains(e.target)) {
            utils.closeCart();
        }
    });
}

initializeApp();