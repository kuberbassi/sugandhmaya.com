// script.js

document.addEventListener("DOMContentLoaded", () => {
  // --- MOCK DATABASE ---
  const products = [
    {
      id: 'prod-purification',
      name: 'Ritual of Purification',
      category: 'Premium Incense',
      price: 499,
      description: 'Hand-rolled with sacred herbs and pure essential oils, this incense is designed to cleanse your space and purify the mind.',
      image: 'https://images.unsplash.com/photo-1593179221043-8551a1793753?q=80&w=800&auto=format&fit=crop',
      thumbnails: [
          'https://images.unsplash.com/photo-1593179221043-8551a1793753?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620052940423-c95583b28859?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1617464324901-fce0243e970a?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1604291799292-2b6352994801?q=80&w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 'prod-connection',
      name: 'Ritual of Connection',
      category: 'Natural Dhoop',
      price: 399,
      description: 'A blend of traditional resins and botanicals, this natural dhoop helps foster a deeper connection during your spiritual practices.',
      image: 'https://images.unsplash.com/photo-1604291799292-2b6352994801?q=80&w=800&auto=format&fit=crop',
      thumbnails: [
          'https://images.unsplash.com/photo-1604291799292-2b6352994801?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1617464324901-fce0243e970a?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1593179221043-8551a1793753?q=80&w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 'prod-devotion',
      name: 'Ritual of Devotion',
      category: 'Puja Samagri Kits',
      price: 999,
      description: 'A complete collection of essentials for your puja rituals. This kit contains everything you need to express your devotion.',
      image: 'https://images.unsplash.com/photo-1617464324901-fce0243e970a?q=80&w=800&auto=format&fit=crop',
      thumbnails: [
          'https://images.unsplash.com/photo-1617464324901-fce0243e970a?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1620052940423-c95583b28859?q=80&w=800&auto=format&fit=crop'
      ]
    }
  ];

  // --- GRAB ALL THE ELEMENTS WE'LL NEED ---
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
  const collectionGrid = document.getElementById("collection-grid");

  let cart = []; // This array will hold all our cart items.

  // --- FUNCTIONS (Our tools) ---

  // Function to dynamically render products on the homepage
  function renderProducts() {
    if (!collectionGrid) return;
    collectionGrid.innerHTML = ""; // Clear existing content
    products.forEach((product, index) => {
      const productCard = document.createElement('a');
      productCard.href = `product.html?id=${product.id}`; // Link to product page with ID
      productCard.className = "product-card-link group block reveal-on-scroll";
      productCard.style.transitionDelay = `${index * 150}ms`;
      productCard.innerHTML = `
        <div class="folded-corner">
            <img src="${product.image}" loading="lazy" alt="${product.name}" class="product-image">
        </div>
        <div class="pt-8 text-center">
            <h3 class="text-2xl font-serif">${product.name}</h3>
            <p class="text-base mt-1">${product.category}</p>
            <p class="text-lg font-bold font-sans mt-2 text-brand-accent">₹${product.price}</p>
        </div>
      `;
      collectionGrid.appendChild(productCard);
    });
  }

  // Function to open the cart sidebar
  function openCart() {
    if (!cartModal) return;
    cartModal.classList.remove("hidden");
    setTimeout(() => {
      cartModal.classList.remove("opacity-0");
      cartPanel.classList.remove("translate-x-full");
    }, 10);
  }

  // Function to close the cart sidebar
  function closeCart() {
    if (!cartModal) return;
    cartModal.classList.add("opacity-0");
    cartPanel.classList.add("translate-x-full");
    setTimeout(() => cartModal.classList.add("hidden"), 400);
  }

  // Function to update what the user sees in the cart
  function updateCartUI() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      if(emptyCartMessage) cartItemsContainer.appendChild(emptyCartMessage);
    } else {
      cart.forEach((item) => {
        const product = products.find(p => p.id === item.id);
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
        return total + product.price * item.quantity;
    }, 0);
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (cartCounter) cartCounter.textContent = totalItems;
  }
  
  // Setup Intersection Observer for scroll animations
  function setupScrollObserver() {
      const revealElements = document.querySelectorAll(".reveal-on-scroll");
      if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
          });
        }, { threshold: 0.1 });
        revealElements.forEach((el) => observer.observe(el));
      }
  }

    // Function to populate the product page
    function populateProductPage() {
        console.log("Product page script running...");
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (!productId) {
          console.error("No product ID found in URL.");
          return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error("Product not found in database for ID:", productId);
            document.querySelector('.product-page-main').innerHTML = '<h1 class="text-center text-2xl p-10">Product not found</h1>';
            return;
        }
        
        console.log("Successfully found product data:", product);

        document.title = `${product.name} - Sugandhmaya`;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-category').textContent = product.category;
        document.getElementById('product-price').textContent = `₹${product.price}`;
        document.getElementById('product-description').textContent = product.description;
        
        const mainImageEl = document.getElementById('main-product-image');
        mainImageEl.src = product.image;
        mainImageEl.alt = product.name;
        
        console.log("Attempting to load main image from:", product.image);

        const thumbnailGrid = document.getElementById('thumbnail-grid');
        thumbnailGrid.innerHTML = '';
        product.thumbnails.forEach((thumbSrc, index) => {
            console.log(`Attempting to load thumbnail ${index + 1} from:`, thumbSrc);
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
    }

  // --- EVENT LISTENERS (The actions) ---
  
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 50);
    });
  }
  
  openCartBtn?.addEventListener("click", openCart);
  closeCartBtn?.addEventListener("click", closeCart);
  cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCart();
  });
  
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
      updateCartUI();
  });

  checkoutBtn?.addEventListener("click", () => {
      if(cart.length > 0) {
          alert("Proceeding to checkout...\nThis is where you would integrate your payment gateway.");
      } else {
          alert("Your cart is empty.");
      }
  });
  
  // Product Page specific logic
  if (document.querySelector(".product-page-main")) {
    populateProductPage();

    const quantityInput = document.getElementById("quantity-input");
    const addToCartBtn = document.getElementById("add-to-cart-product");
    
    document.getElementById("increase-quantity")?.addEventListener("click", () => quantityInput.value++);
    document.getElementById("decrease-quantity")?.addEventListener("click", () => {
        if (quantityInput.value > 1) quantityInput.value--;
    });

    addToCartBtn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.productId;
        if (!productId) return;

        const quantity = parseInt(quantityInput.value);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity: quantity });
        }
        updateCartUI();
        openCart();
    });
    
    document.querySelectorAll(".accordion-header").forEach(header => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const content = header.nextElementSibling;
        item.classList.toggle("active");
        content.style.maxHeight = item.classList.contains("active") ? content.scrollHeight + "px" : "0";
      });
    });
  }

  // --- INITIALIZE ---
  renderProducts();
  updateCartUI();
  setupScrollObserver();
});