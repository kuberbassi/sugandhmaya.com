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
    saveCart() { localStorage.setItem(config.storageKeys.cart, JSON.stringify(state.cart)); },
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
    updateCartUI() {
        const cartItemsContainer = document.getElementById("cart-items");
        const cartSubtotalEl = document.getElementById("cart-subtotal");
        const cartCounter = document.getElementById("cart-counter");
        const emptyCartMessage = document.getElementById("empty-cart-message");
        const checkoutBtn = document.getElementById("checkout-button");

        if (!cartItemsContainer || !cartSubtotalEl || !cartCounter || !emptyCartMessage || !checkoutBtn) return;

        cartItemsContainer.innerHTML = "";

        if (state.cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            state.cart.forEach((item) => {
                const product = state.products.find(p => p.id === item.productId);
                if (!product) return;
                const variant = product.variants.find(v => v.size === item.size);
                if (!variant) return;

                const itemEl = document.createElement("div");
                itemEl.className = "flex items-center gap-4 py-3 border-b border-gray-100";
                itemEl.innerHTML = `
                    <img src="${variant.image}" alt="${product.name}" class="w-16 h-20 object-cover rounded" loading="lazy">
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

        const subtotal = state.cart.reduce((total, item) => {
            const product = state.products.find(p => p.id === item.productId);
            const variant = product ? product.variants.find(v => v.size === item.size) : null;
            return total + (variant ? variant.price * item.quantity : 0);
        }, 0);
        const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
        cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        cartCounter.textContent = totalItems;
        if (document.body.classList.contains("checkout-page")) pages.updateCheckoutSummary();
    },
    openCart() {
        const cartModal = document.getElementById("cart-modal");
        const cartPanel = document.getElementById("cart-panel");
        if (!cartModal || !cartPanel) return;
        cartModal.classList.remove("hidden");
        document.body.classList.add('cart-open');
        setTimeout(() => {
            cartModal.classList.remove("opacity-0");
            cartPanel.classList.remove("translate-x-full");
        }, 20);
    },
    closeCart() {
        const cartModal = document.getElementById("cart-modal");
        const cartPanel = document.getElementById("cart-panel");
        if (!cartModal || !cartPanel) return;
        cartModal.classList.add("opacity-0");
        cartPanel.classList.add("translate-x-full");
        document.body.classList.remove('cart-open');
        setTimeout(() => cartModal.classList.add("hidden"), 500);
    },
    setupScrollObserver() {
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
};

// --- 4. CART ACTIONS (THE PERMANENT FIX) ---
const cartActions = {
    add(item) {
        const existingItem = state.cart.find(i => i.cartItemId === item.cartItemId);
        if (existingItem) existingItem.quantity += item.quantity;
        else state.cart.push(item);
        utils.saveCart();
        utils.updateCartUI(); // Instant update
        utils.showToast(`${item.quantity} item(s) added to cart.`);
        utils.openCart();
    },
    remove(cartItemId) {
        state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
        utils.saveCart();
        utils.updateCartUI(); // Instant update
    },
    updateQuantity(cartItemId, change) {
        const itemInCart = state.cart.find(i => i.cartItemId === cartItemId);
        if (itemInCart) {
            itemInCart.quantity += change;
            if (itemInCart.quantity <= 0) this.remove(cartItemId);
            else {
                utils.saveCart();
                utils.updateCartUI(); // Instant update
            }
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
                <div class="product-image-container"><img src="${product.variants[0].image}" loading="lazy" alt="${product.name}" class="product-image"></div>
                <div class="pt-6 text-center">
                    <h3 class="text-xl font-serif">${product.name}</h3>
                    <p class="text-base mt-1 text-gray-500">${product.category}</p>
                    <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
                </div>
            </a>`).join('');
    },
    shop() {
        const shopGrid = document.getElementById('shop-grid');
        const categoryFilter = document.getElementById('category-filter');
        if (!shopGrid || !categoryFilter) return;
        const categories = [...new Set(state.products.map(p => p.category))];
        categoryFilter.innerHTML = `<label class="filter-label"><input type="radio" name="category" value="all" checked><span>All Products</span></label>`;
        categories.forEach(category => {
            categoryFilter.innerHTML += `<label class="filter-label"><input type="radio" name="category" value="${category}"><span>${category}</span></label>`;
        });
        function displayProducts(filter) {
            const filteredProducts = state.products.filter(p => filter === 'all' || p.category === filter);
            shopGrid.innerHTML = filteredProducts.map(product => `
                <a href="product.html?id=${product.id}" class="product-card-link group block">
                    <div class="product-image-container"><img src="${product.variants[0].image}" loading="lazy" alt="${product.name}" class="product-image"></div>
                    <div class="pt-8 text-center">
                        <h3 class="text-2xl font-serif">${product.name}</h3>
                        <p class="text-base mt-1">${product.category}</p>
                        <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
                    </div>
                </a>`).join('');
        }
        displayProducts('all');
        categoryFilter.addEventListener('change', e => e.target.name === 'category' && displayProducts(e.target.value));
    },
    product() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = state.products.find(p => p.id === productId);
        if (!product) {
            document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
            return;
        }

        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.accordion-content').style.maxHeight = '0';
        });

        let selectedSize = product.variants[0].size;
        
        document.title = `${product.name} - Sugandhmaya`;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-category').textContent = product.category;
        document.getElementById('product-description').textContent = product.description;

        const renderOptions = (containerId, options, label) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            if (!options || options.length <= 1) {
                container.style.display = 'none';
                return;
            }
            container.style.display = 'block';
            let html = `<label class="block subheading mb-3">${label}</label><div class="flex flex-wrap gap-3">`;
            options.forEach((opt, index) => {
                html += `<label><input type="radio" name="${label.toLowerCase()}" value="${opt}" ${index === 0 ? 'checked' : ''}><span>${opt}</span></label>`;
            });
            html += '</div>';
            container.innerHTML = html;
        };

        const updateVariantUI = () => {
            const variant = product.variants.find(v => v.size === selectedSize);
            if (!variant) return;
            document.getElementById('product-price').textContent = `₹${variant.price}`;
            document.getElementById('main-product-image').src = variant.image;
            const thumbnailGrid = document.getElementById('thumbnail-grid');
            thumbnailGrid.innerHTML = variant.thumbnails.map(thumb => `<img src="${thumb}" class="thumbnail-image" data-src="${thumb}">`).join('');
            document.querySelector('.thumbnail-image')?.classList.add('active');
        };
        
        renderOptions('scent-options', product.scents, 'Scent');
        renderOptions('size-options', product.variants.map(v => v.size), 'Size');
        updateVariantUI();

        document.getElementById('size-options')?.addEventListener('change', e => {
            if (e.target.name === 'size') {
                selectedSize = e.target.value;
                updateVariantUI();
            }
        });
    },
    checkout() {
        // Phone Input
        const phoneInput = document.querySelector("#phone-input");
        if (phoneInput && typeof intlTelInput !== 'undefined' && !phoneInput.classList.contains('iti-initialized')) {
            phoneInput.classList.add('iti-initialized');
            window.iti = intlTelInput(phoneInput, { initialCountry: "in", separateDialCode: true, utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js" });
        }

        // Country & State Selectors
        const countrySelect = document.getElementById('country-select');
        const stateSelect = document.getElementById('state-select');
        
        if(countrySelect && stateSelect && typeof csc !== 'undefined') {
            const countries = csc.getAllCountries();
            countrySelect.innerHTML = countries.map(c => `<option value="${c.isoCode}">${c.name}</option>`).join('');
            
            // Set default and load initial states
            countrySelect.value = 'IN'; // Default to India
            let states = csc.getStatesOfCountry('IN');
            stateSelect.innerHTML = states.map(s => `<option value="${s.isoCode}">${s.name}</option>`).join('');

            countrySelect.addEventListener('change', () => {
                states = csc.getStatesOfCountry(countrySelect.value);
                stateSelect.innerHTML = states.map(s => `<option value="${s.isoCode}">${s.name}</option>`).join('');
            });
        }
        
        pages.updateCheckoutSummary();
    },
    updateCheckoutSummary() {
        const summaryItems = document.getElementById('summary-items');
        if (!summaryItems) return;
        summaryItems.innerHTML = '';
        let total = 0;
        state.cart.forEach(item => {
            const product = state.products.find(p => p.id === item.productId);
            const variant = product ? product.variants.find(v => v.size === item.size) : null;
            if (variant) {
                total += variant.price * item.quantity;
                summaryItems.innerHTML += `<div class="flex justify-between items-center"><div><p class="font-semibold">${product.name} <span class="text-sm font-normal">x ${item.quantity}</span></p><p class="text-sm text-gray-500">${item.scent} / ${item.size}</p></div><span>₹${(variant.price * item.quantity).toFixed(2)}</span></div>`;
            }
        });
        document.getElementById('summary-total').textContent = `₹${total.toFixed(2)}`;
    },
    confirmation() {
        const confirmationDetails = document.getElementById('confirmation-details');
        if (!confirmationDetails) return;
        const orderData = JSON.parse(localStorage.getItem(config.storageKeys.latestOrder));
        if (orderData) {
            confirmationDetails.innerHTML = `<p><strong>Order for:</strong> ${orderData.customer.name}</p><p><strong>Email:</strong> ${orderData.customer.email}</p><p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)} (Cash on Delivery)</p>`;
        } else {
            confirmationDetails.innerHTML = '<p>Order details not found.</p>';
        }
        state.cart = [];
        utils.saveCart();
        utils.updateCartUI();
        localStorage.removeItem(config.storageKeys.latestOrder);
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

    utils.updateCartUI();
    utils.setupScrollObserver();
}

function setupGlobalListeners() {
    let orderPayload = {};
    
    document.body.addEventListener('click', e => {
        const target = e.target;
        
        if (target.closest("#open-cart-button")) utils.openCart();
        if (target.closest("#close-cart-button") || target.id === "cart-modal") utils.closeCart();
        
        const quantityChangeBtn = target.closest(".quantity-change");
        if (quantityChangeBtn) cartActions.updateQuantity(quantityChangeBtn.dataset.id, parseInt(quantityChangeBtn.dataset.change));

        const removeItemBtn = target.closest(".remove-item");
        if (removeItemBtn) cartActions.remove(removeItemBtn.dataset.id);
        
        const checkoutBtn = target.closest('#checkout-button');
        if (checkoutBtn) {
            e.preventDefault();
            if (state.cart.length === 0) utils.showToast("Your cart is empty.");
            else window.location.href = 'checkout.html';
        }

        const accordionHeader = target.closest('.accordion-header');
        if (accordionHeader) {
            const accordionItem = accordionHeader.parentElement;
            const content = accordionHeader.nextElementSibling;
            const wasActive = accordionItem.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.maxHeight = '0';
            });
            if (!wasActive) {
                accordionItem.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        }
        
        const contactBubble = target.closest('.contact-bubble');
        const contactPopover = document.getElementById('contact-popover');
        if (contactBubble && contactPopover) {
            document.getElementById('popover-title').textContent = contactBubble.dataset.title;
            document.getElementById('popover-body').innerHTML = contactBubble.dataset.content;
            contactPopover.classList.remove('hidden');
            setTimeout(() => contactPopover.classList.add('visible'), 10);
        }
        if ((target.id === 'contact-popover' || target.closest('#popover-close')) && contactPopover?.classList.contains('visible')) {
            contactPopover.classList.remove('visible');
            setTimeout(() => contactPopover.classList.add('hidden'), 300);
        }
        
        if (document.querySelector(".product-page-main")) {
            if (target.closest('#add-to-cart-product')) {
                const productId = new URLSearchParams(window.location.search).get('id');
                const product = state.products.find(p => p.id === productId);
                if (!product) return;
                const selectedSizeEl = document.querySelector('input[name="size"]:checked');
                if (!selectedSizeEl) {
                    utils.showToast("Please select a size.");
                    return;
                }
                const selectedScentEl = document.querySelector('input[name="scent"]:checked');
                const selectedSize = selectedSizeEl.value;
                const selectedScent = selectedScentEl ? selectedScentEl.value : (product.scents.length > 0 ? product.scents[0] : 'N/A');
                const quantity = parseInt(document.getElementById("quantity-input").value);
                const cartItemId = `${productId}_${selectedSize}_${selectedScent}`;
                cartActions.add({ cartItemId, productId, size: selectedSize, scent: selectedScent, quantity });
            }

            if (target.closest('#decrease-quantity')) {
                let quantityInput = document.getElementById("quantity-input");
                if (parseInt(quantityInput.value) > 1) quantityInput.value--;
            }
            if (target.closest('#increase-quantity')) {
                let quantityInput = document.getElementById("quantity-input");
                quantityInput.value++;
            }

            const thumbnail = target.closest('.thumbnail-image');
            if (thumbnail) {
                document.getElementById('main-product-image').src = thumbnail.dataset.src;
                document.querySelectorAll('.thumbnail-image').forEach(t => t.classList.remove('active'));
                thumbnail.classList.add('active');
            }
        }
    });

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('span');
            try {
                submitButton.disabled = true;
                if (buttonText) buttonText.textContent = 'Sending Code...';
                const formData = new FormData(e.target);
                const customerDetails = Object.fromEntries(formData.entries());
                
                if (window.iti) customerDetails.phone = window.iti.getNumber();

                orderPayload = {
                    customer: customerDetails,
                    items: state.cart.map(item => ({ productId: item.productId, size: item.size, scent: item.scent, quantity: item.quantity }))
                };
                const response = await fetch(`${config.apiBaseUrl}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: customerDetails.email })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Failed to send OTP.');
                }
                utils.showToast('Verification code sent!');
                const otpModal = document.getElementById('otp-modal');
                if (otpModal) {
                    otpModal.classList.remove('hidden');
                    otpModal.classList.add('flex');
                }
            } catch (error) {
                utils.showToast(`Error: ${error.message}`);
            } finally {
                submitButton.disabled = false;
                if (buttonText) buttonText.textContent = 'Place Order';
            }
        });
    }

    const verifyOtpBtn = document.getElementById('verify-otp-button');
    if(verifyOtpBtn){
        verifyOtpBtn.addEventListener('click', async () => {
            const otpInput = document.getElementById('otp-input');
            const otp = otpInput.value;
            if (!otp || otp.length !== 6) return utils.showToast("Please enter the 6-digit code.");
            const buttonText = verifyOtpBtn.querySelector('span');
            verifyOtpBtn.disabled = true;
            if (buttonText) buttonText.textContent = 'Verifying...';
            orderPayload.otp = otp;
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                if (response.ok) {
                    const result = await response.json();
                    const finalOrderData = { customer: orderPayload.customer, total: result.total };
                    localStorage.setItem(config.storageKeys.latestOrder, JSON.stringify(finalOrderData));
                    window.location.href = 'confirmation.html';
                } else {
                    const result = await response.json();
                    throw new Error(result.message || 'Verification Failed.');
                }
            } catch (error) {
                utils.showToast(`Error: ${error.message}`);
            } finally {
                verifyOtpBtn.disabled = false;
                if (buttonText) buttonText.textContent = 'Verify & Place Order';
            }
        });
    }
    
    const cancelOtpBtn = document.getElementById('cancel-otp-button');
    if(cancelOtpBtn) cancelOtpBtn.addEventListener('click', () => document.getElementById('otp-modal')?.classList.add('hidden'));

    const header = document.getElementById("main-header");
    if (header) window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 50));
}

document.addEventListener('DOMContentLoaded', initializeApp);