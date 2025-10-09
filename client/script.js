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
        } catch (error) {
            console.error(`Failed to load component from ${filePath}:`, error);
        }
    }
}

async function loadHeader() {
    await loadComponent('header-container', config.headerPath);
}

async function loadFooter() {
    await loadComponent('footer-container', config.footerPath);
}

// --- 3. CORE UTILITY FUNCTIONS ---
const utils = {
    async fetchProducts() {
        try {
            console.log("Attempting to fetch products...");
            const response = await fetch(`${config.apiBaseUrl}/api/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            state.products = await response.json();
            console.log("✅ Products fetched successfully:", state.products);
            if (state.products.length === 0) {
                console.warn("Warning: Fetched 0 products. Is the database seeded?");
            }
        } catch (error) {
            console.error("❌ Could not fetch products:", error);
            // Display an error message to the user on the page
            const shopGrid = document.getElementById('shop-grid');
            if (shopGrid) shopGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Could not load products. Please ensure the server is running and refresh the page.</p>`;
        }
    },

    saveCart() {
        localStorage.setItem(config.storageKeys.cart, JSON.stringify(state.cart));
    },

    showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error('Toast container not found!');
            alert(message);
            return;
        }

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;

        toastContainer.innerHTML = '';
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
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

        if (!cartItemsContainer || !cartSubtotalEl || !cartCounter || !emptyCartMessage) return;

        cartItemsContainer.innerHTML = "";

        if (state.cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
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

// --- 4. PAGE-SPECIFIC RENDER FUNCTIONS ---
const pages = {
    home() {
        const collectionGrid = document.getElementById("collection-grid");
        if (!collectionGrid) return;
        if (state.products.length === 0) {
            collectionGrid.innerHTML = '<p class="text-center col-span-full">Could not load products. Is the server running?</p>';
            return;
        }
        let gridHTML = "";
        const topProducts = state.products.slice(0, 3);
        topProducts.forEach((product) => {
            const displayImage = product.variants && product.variants.length > 0 ? product.variants[0].image : product.image;
            gridHTML += `
                <a href="product.html?id=${product.id}" class="product-card-link group block">
                    <div class="product-image-container"><img src="${displayImage}" loading="lazy" alt="${product.name}" class="product-image"></div>
                    <div class="pt-6 text-center">
                        <h3 class="text-xl font-serif">${product.name}</h3>
                        <p class="text-base mt-1 text-gray-500">${product.category}</p>
                        <p class="text-lg font-bold font-sans mt-2 text-brand-accent">Starting from ₹${product.variants[0].price}</p>
                    </div>
                </a>`;
        });
        collectionGrid.innerHTML = gridHTML;
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
            shopGrid.innerHTML = '';
            const filteredProducts = state.products.filter(p => filter === 'all' || p.category === filter);
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
                    <div class="product-image-container"><img src="${displayImage}" loading="lazy" alt="${product.name}" class="product-image"></div>
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
    },

    product() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (!productId) return;
        const product = state.products.find(p => p.id === productId);

        if (!product) {
            const mainContent = document.querySelector('.product-page-main');
            if (mainContent) mainContent.innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
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
        const scrollLeftBtn = document.getElementById('scroll-left');
        const scrollRightBtn = document.getElementById('scroll-right');

        const renderScents = () => {
            if (!scentOptionsContainer) return;
            if (!product.scents || product.scents.length <= 1) {
                if (scentOptionsContainer.parentElement) scentOptionsContainer.parentElement.style.display = 'none';
                return;
            }
            let scentHtml = '<label class="block subheading mb-3">Scent</label><div class="flex flex-wrap gap-3">';
            product.scents.forEach((scent, index) => {
                scentHtml += `<label><input type="radio" name="scent" value="${scent}" ${index === 0 ? 'checked' : ''}><span>${scent}</span></label>`;
            });
            scentHtml += '</div>';
            scentOptionsContainer.innerHTML = scentHtml;
        };
        const renderSizes = () => {
            if (!sizeOptionsContainer) return;
            let sizeHtml = '<label class="block subheading mb-3">Size</label><div class="flex flex-wrap gap-3">';
            product.variants.forEach((variant, index) => {
                sizeHtml += `<label><input type="radio" name="size" value="${variant.size}" ${index === 0 ? 'checked' : ''}><span>${variant.size}</span></label>`;
            });
            sizeHtml += '</div>';
            sizeOptionsContainer.innerHTML = sizeHtml;
        };
        const updateVariantUI = () => {
            const variant = product.variants.find(v => v.size === selectedSize);
            if (!variant) return;
            if (priceEl) priceEl.textContent = `₹${variant.price}`;
            if (mainImageEl) mainImageEl.src = variant.image;
            if (thumbnailGrid) {
                thumbnailGrid.innerHTML = '';
                variant.thumbnails.forEach((thumbSrc) => {
                    const thumbImg = document.createElement('img');
                    thumbImg.src = thumbSrc;
                    thumbImg.alt = `Thumbnail for ${variant.size}`;
                    thumbImg.className = 'thumbnail-image';
                    thumbImg.dataset.src = thumbSrc;
                    thumbnailGrid.appendChild(thumbImg);
                });
                updateActiveThumbnail(variant.image);
            }
        };
        const updateActiveThumbnail = (src) => {
            document.querySelectorAll('.thumbnail-image').forEach(t => t.classList.toggle('active', t.dataset.src === src));
        };

        document.title = `${product.name} - Sugandhmaya`;
        if (nameEl) nameEl.textContent = product.name;
        if (categoryEl) categoryEl.textContent = product.category;
        if (descriptionEl) descriptionEl.textContent = product.description;

        renderScents();
        renderSizes();
        updateVariantUI();

        sizeOptionsContainer?.addEventListener('change', e => {
            if (e.target.name === 'size') {
                selectedSize = e.target.value;
                updateVariantUI();
            }
        });
        scentOptionsContainer?.addEventListener('change', e => {
            if (e.target.name === 'scent') selectedScent = e.target.value;
        });
        thumbnailGrid?.addEventListener('click', e => {
            const clickedThumbnail = e.target.closest('.thumbnail-image');
            if (!clickedThumbnail || clickedThumbnail.classList.contains('active')) return;
            if (mainImageEl) mainImageEl.style.opacity = '0';
            setTimeout(() => {
                if (mainImageEl) {
                    mainImageEl.src = clickedThumbnail.src;
                    mainImageEl.style.opacity = '1';
                }
            }, 200);
            updateActiveThumbnail(clickedThumbnail.dataset.src);
        });
        const scrollThumbnails = (direction) => {
            const scroller = document.getElementById('thumbnail-track-container');
            if (!scroller) return;
            scroller.scrollBy({ left: direction * (3 * (80 + 12)), behavior: 'smooth' });
        };
        scrollLeftBtn?.addEventListener('click', () => scrollThumbnails(-1));
        scrollRightBtn?.addEventListener('click', () => scrollThumbnails(1));
    },

    checkout() {
        const summaryItems = document.getElementById('summary-items');
        if (!summaryItems) return;
        summaryItems.innerHTML = '';
        const summaryTotal = document.getElementById('summary-total');
        let total = 0;
        state.cart.forEach(item => {
            const product = state.products.find(p => p.id === item.productId);
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
    },

    confirmation() {
        const confirmationDetails = document.getElementById('confirmation-details');
        if (!confirmationDetails) return;
        const orderData = JSON.parse(localStorage.getItem(config.storageKeys.latestOrder));
        if (orderData) {
            confirmationDetails.innerHTML = `
                <p><strong>Order for:</strong> ${orderData.customer.name}</p>
                <p><strong>Email:</strong> ${orderData.customer.email}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)} (Cash on Delivery)</p>
            `;
        } else {
            confirmationDetails.innerHTML = '<p>Order details not found.</p>';
        }
        localStorage.removeItem(config.storageKeys.cart);
        state.cart = [];
        localStorage.removeItem(config.storageKeys.latestOrder);
    }
};

// --- 5. INITIALIZATION LOGIC ---
async function initializeApp() {
    await loadHeader();
    await loadFooter();
    await utils.fetchProducts();

    const bodyClasses = document.body.classList;
    if (bodyClasses.contains("home-page")) pages.home();
    if (bodyClasses.contains("shop-page")) pages.shop();
    if (document.querySelector(".product-page-main")) pages.product();
    if (bodyClasses.contains("checkout-page")) pages.checkout();
    if (document.getElementById('confirmation-details')) pages.confirmation();

    setupGlobalListeners();
    setupPageSpecificListeners();
    utils.updateCartUI();
    utils.setupScrollObserver();
}

// --- 6. EVENT LISTENERS ---
function setupGlobalListeners() {
    const header = document.getElementById("main-header");
    const openCartBtn = document.getElementById("open-cart-button");
    const closeCartBtn = document.getElementById("close-cart-button");
    const cartModal = document.getElementById("cart-modal");
    const cartItemsContainer = document.getElementById("cart-items");
    const checkoutBtn = document.getElementById("checkout-button");
    const checkoutForm = document.getElementById('checkout-form');

    if (header) {
        window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 50));
    }
    openCartBtn?.addEventListener("click", utils.openCart);
    closeCartBtn?.addEventListener("click", utils.closeCart);
    cartModal?.addEventListener("click", (e) => {
        if (e.target === cartModal) utils.closeCart();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !cartModal?.classList.contains('hidden')) utils.closeCart();
    });
    cartItemsContainer?.addEventListener("click", (e) => {
        const target = e.target.closest("button");
        if (!target) return;
        const cartItemId = target.dataset.id;
        const itemInCart = state.cart.find(i => i.cartItemId === cartItemId);
        if (!itemInCart) return;

        if (target.classList.contains("quantity-change")) {
            itemInCart.quantity += parseInt(target.dataset.change);
            if (itemInCart.quantity <= 0) {
                state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
            }
        }
        if (target.classList.contains("remove-item")) {
            state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
        }
        utils.saveCart();
        utils.updateCartUI();
        if (document.body.classList.contains("checkout-page")) pages.checkout();
    });
    checkoutBtn?.addEventListener("click", (e) => {
        if (state.cart.length === 0) {
            e.preventDefault();
            utils.showToast("Your cart is empty.");
        }
    });
    document.getElementById('add-to-cart-product')?.addEventListener('click', () => {
        const productId = new URLSearchParams(window.location.search).get('id');
        const product = state.products.find(p => p.id === productId);
        if (!product) return;

        const selectedSizeEl = document.querySelector('input[name="size"]:checked');
        const selectedScentEl = document.querySelector('input[name="scent"]:checked');
        const quantityEl = document.getElementById("quantity-input");
        if (!selectedSizeEl || !quantityEl) return;

        const selectedSize = selectedSizeEl.value;
        const selectedScent = selectedScentEl ? selectedScentEl.value : product.scents[0];
        const quantity = parseInt(quantityEl.value);
        const cartItemId = `${productId}_${selectedSize}_${selectedScent}`;
        const existingItem = state.cart.find(item => item.cartItemId === cartItemId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            state.cart.push({ cartItemId, productId, size: selectedSize, scent: selectedScent, quantity });
        }
        utils.saveCart();
        utils.updateCartUI();
        utils.showToast(`${quantity} item(s) added to cart.`);
        utils.openCart();
    });

    if (checkoutForm) {
        let orderPayload = {};
        const otpModal = document.getElementById('otp-modal');
        const otpInput = document.getElementById('otp-input');
        const verifyOtpBtn = document.getElementById('verify-otp-button');
        const cancelOtpBtn = document.getElementById('cancel-otp-button');

        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Step 1: 'Place Order' button clicked.");

            const submitButton = e.target.querySelector('button[type="submit"]');
            const buttonText = submitButton.querySelector('span');

            try {
                submitButton.disabled = true;
                if (buttonText) buttonText.textContent = 'Sending Code...';

                const formData = new FormData(e.target);
                const customerDetails = Object.fromEntries(formData.entries());

                orderPayload = {
                    customer: customerDetails,
                    items: state.cart.map(item => ({
                        productId: item.productId,
                        size: item.size,
                        scent: item.scent,
                        quantity: item.quantity
                    }))
                };

                console.log("Step 2: Sending request to /api/send-otp...");
                const response = await fetch(`${config.apiBaseUrl}/api/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: customerDetails.email })
                });

                console.log("Step 3: Received response from server. Status:", response.status);
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Failed to send OTP.');
                }

                utils.showToast('Verification code sent!');

                console.log("Step 4: Attempting to show OTP modal.");
                const otpModal = document.getElementById('otp-modal');
                if (otpModal) {
                    console.log("✅ Modal element found. Making it visible.");
                    otpModal.classList.remove('hidden');
                    otpModal.classList.add('flex');
                } else {
                    console.error("❌ CRITICAL: Could not find #otp-modal element in your HTML!");
                }

            } catch (error) {
                console.error("An error occurred during OTP sending:", error);
                utils.showToast(`Error: ${error.message}`);
            } finally {
                submitButton.disabled = false;
                if (buttonText) buttonText.textContent = 'Place Order';
            }
        });

        verifyOtpBtn?.addEventListener('click', async () => {
            const otp = otpInput.value;
            if (!otp || otp.length !== 6) {
                return utils.showToast("Please enter the 6-digit code.");
            }

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

        cancelOtpBtn?.addEventListener('click', () => {
            otpModal.classList.add('hidden');
            otpModal.classList.remove('flex');
        });
    }
}

function setupPageSpecificListeners() {
    const quantityInput = document.getElementById("quantity-input");
    const decreaseBtn = document.getElementById("decrease-quantity");
    const increaseBtn = document.getElementById("increase-quantity");
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    const contactPopover = document.getElementById('contact-popover');
    const contactPopoverClose = document.getElementById('popover-close');

    if (quantityInput) {
        decreaseBtn?.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) quantityInput.value = currentValue - 1;
        });
        increaseBtn?.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const content = header.nextElementSibling;
            if (!accordionItem || !content) return;
            const wasActive = accordionItem.classList.contains('active');
            if (!wasActive) {
                accordionItem.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                accordionItem.classList.remove('active');
                content.style.maxHeight = '0';
            }
        });
    });

    const contactBubblesContainer = document.getElementById('contact-bubbles-container');
    const contactPopoverContent = document.getElementById('contact-popover-content');
    if (contactBubblesContainer && contactPopover && contactPopoverContent) {
        const popoverTitle = document.getElementById('popover-title');
        const popoverBody = document.getElementById('popover-body');
        contactBubblesContainer.addEventListener('click', (e) => {
            const bubble = e.target.closest('.contact-bubble');
            if (bubble) {
                popoverTitle.textContent = bubble.dataset.title;
                popoverBody.innerHTML = bubble.dataset.content;
                contactPopover.classList.remove('hidden');
                setTimeout(() => {
                    contactPopover.classList.add('visible');
                    contactPopoverContent.classList.add('scale-100');
                }, 20);
            }
        });
        const closePopover = () => {
            contactPopover.classList.remove('visible');
            contactPopoverContent.classList.remove('scale-100');
            setTimeout(() => {
                contactPopover.classList.add('hidden');
            }, 300);
        };
        contactPopover.addEventListener('click', (e) => {
            if (e.target === contactPopover) {
                closePopover();
            }
        });
        contactPopoverClose?.addEventListener('click', closePopover);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);