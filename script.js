// script.js

document.addEventListener("DOMContentLoaded", () => {
  // This is the main function that runs the whole application
  async function initializeApp() {
    // --- GLOBAL STATE ---
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- UTILITY FUNCTIONS ---
    async function fetchProducts() {
      try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
      } catch (error) {
        console.error("Could not fetch products:", error);
      }
    }

    function saveCart() {
      localStorage.setItem('cart', JSON.stringify(cart));
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
        if(emptyCartMessage) cartItemsContainer.appendChild(emptyCartMessage);
      } else {
        cart.forEach((item) => {
          const product = products.find(p => p.id === item.id);
          if (!product) return;
          const itemEl = document.createElement("div");
          itemEl.className = "flex items-center gap-4 py-3 border-b border-gray-100";
          itemEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-16 h-20 object-cover rounded">
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
      
      if(products.length === 0) {
          collectionGrid.innerHTML = '<p class="text-center col-span-full">Could not load products.</p>';
          return;
      }

      collectionGrid.innerHTML = "";
      products.forEach((product, index) => {
        const productCard = document.createElement('a');
        productCard.href = `product.html?id=${product.id}`;
        productCard.className = "product-card-link group block reveal-on-scroll";
        productCard.style.transitionDelay = `${index * 150}ms`;
        productCard.innerHTML = `
          <div class="folded-corner"><img src="${product.image}" loading="lazy" alt="${product.name}" class="product-image"></div>
          <div class="pt-8 text-center">
              <h3 class="text-2xl font-serif">${product.name}</h3>
              <p class="text-base mt-1">${product.category}</p>
              <p class="text-lg font-bold font-sans mt-2 text-brand-accent">₹${product.price}</p>
          </div>`;
        collectionGrid.appendChild(productCard);
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
        mainImageEl.src = product.image;
        mainImageEl.alt = product.name;

        const thumbnailGrid = document.getElementById('thumbnail-grid');
        thumbnailGrid.innerHTML = '';
        product.thumbnails.forEach((thumbSrc, index) => {
            const thumbImg = document.createElement('img');
            thumbImg.src = thumbSrc;
            thumbImg.alt = `Thumbnail ${index + 1}`;
            thumbImg.className = 'thumbnail-image';
            if (index === 0) thumbImg.classList.add('active');
            thumbImg.addEventListener('click', () => {
                mainImageEl.src = thumbSrc;
                document.querySelectorAll('.thumbnail-image').forEach(t => t.classList.remove('active'));
                thumbImg.classList.add('active');
            });
            thumbnailGrid.appendChild(thumbImg);
        });

        document.getElementById('add-to-cart-product').dataset.productId = product.id;
      } else if (productId) {
        document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
      }
    }

    function renderCheckoutPage() {
        const summaryItems = document.getElementById('summary-items');
        const summaryTotal = document.getElementById('summary-total');
        let total = 0;
        
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if(product) {
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
        const orderData = JSON.parse(localStorage.getItem('latestOrder'));
        if (orderData) {
            document.getElementById('confirmation-details').innerHTML = `
                <p><strong>Order for:</strong> ${orderData.customer.name}</p>
                <p><strong>Email:</strong> ${orderData.customer.email}</p>
                <p><strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)} (Cash on Delivery)</p>
            `;
        }
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
    });

    checkoutBtn?.addEventListener("click", () => {
        if(cart.length > 0) {
            window.location.href = 'checkout.html';
        } else {
            alert("Your cart is empty.");
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
    });

    document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const total = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.id);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);

        const formData = new FormData(e.target);
        const customerDetails = Object.fromEntries(formData.entries());
        const orderData = { customer: customerDetails, items: cart, total: total };
        localStorage.setItem('latestOrder', JSON.stringify(orderData));
        
        cart = [];
        saveCart();
        window.location.href = 'confirmation.html';
    });
    
    // --- INITIALIZE APP ---
    // 1. Fetch data first
    await fetchProducts();
    
    // 2. Determine which page we are on and render its specific content
    if (document.getElementById("collection-grid")) renderHomePage();
    if (document.querySelector(".product-page-main")) renderProductPage();
    if (document.querySelector(".checkout-page")) renderCheckoutPage();
    if (document.getElementById('confirmation-details')) renderConfirmationPage();

    // 3. Update UI components that are on every page
    updateCartUI();
    
    // 4. Set up animations after content is rendered
    setupScrollObserver();
  }

  initializeApp();
});