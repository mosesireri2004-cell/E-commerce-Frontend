const products = [
  {
    id: "studio-headphones",
    name: "Studio headphones",
    category: "Tech",
    price: 89,
    description: "Sound good. Feel even better.",
    tag: "Best seller",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "everyday-watch",
    name: "Everyday watch",
    category: "Accessories",
    price: 64,
    description: "A classic, without the fuss.",
    tag: "New",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "instant-camera",
    name: "Instant camera",
    category: "Tech",
    price: 119,
    description: "Keep the good moments close.",
    tag: "A good one",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "weekend-sneaker",
    name: "Weekend sneaker",
    category: "Accessories",
    price: 78,
    description: "Your feet called. They said thanks.",
    tag: "Everyday pick",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "carryall-backpack",
    name: "Carryall backpack",
    category: "Accessories",
    price: 72,
    description: "Room for plans, and then some.",
    tag: "Made to go",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "little-speaker",
    name: "Little speaker",
    category: "Tech",
    price: 54,
    description: "Small speaker. Big good mood.",
    tag: "Good sound",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "ceramic-vase",
    name: "Sunday ceramic vase",
    category: "Home",
    price: 38,
    description: "For flowers or just for looking.",
    tag: "Small batch",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "desk-lamp",
    name: "Soft glow desk lamp",
    category: "Home",
    price: 96,
    description: "A softer kind of spotlight.",
    tag: "A good one",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85",
  },
];

const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 6.95;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const cart = new Map();

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const noResults = document.querySelector("#no-results");
const cartDrawer = document.querySelector("#cart-drawer");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const toast = document.querySelector("#toast");

let activeCategory = "All";
let toastTimeout;

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleProducts = products
    .filter((product) => activeCategory === "All" || product.category === activeCategory)
    .filter((product) =>
      `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm),
    );

  if (sortSelect.value === "price-low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-high") visibleProducts.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "name") visibleProducts.sort((a, b) => a.name.localeCompare(b.name));

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
            <span class="product-tag">${product.tag}</span>
            <button class="add-to-cart" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button>
          </div>
          <div class="product-info">
            <p class="product-category">${product.category}</p>
            <div class="product-name-row">
              <h3 class="product-name">${product.name}</h3>
              <span class="product-price">${money.format(product.price)}</span>
            </div>
            <p class="product-description">${product.description}</p>
          </div>
        </article>
      `,
    )
    .join("");

  noResults.hidden = visibleProducts.length > 0;
}

function getCartQuantity() {
  return [...cart.values()].reduce((total, quantity) => total + quantity, 0);
}

function getSubtotal() {
  return [...cart.entries()].reduce((total, [productId, quantity]) => {
    const product = products.find((item) => item.id === productId);
    return total + product.price * quantity;
  }, 0);
}

function renderCart() {
  const entries = [...cart.entries()];
  const itemCount = getCartQuantity();
  const subtotal = getSubtotal();
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  document.querySelector("#cart-count").textContent = String(itemCount);
  document.querySelector("#cart-heading-count").textContent = `(${itemCount})`;
  document.querySelector("#cart-subtotal").textContent = money.format(subtotal);
  document.querySelector("#cart-shipping").textContent = shipping === 0 && subtotal > 0
    ? "Free"
    : money.format(shipping);
  document.querySelector("#cart-total").textContent = money.format(subtotal + shipping);
  document.querySelector("#checkout-button").disabled = itemCount === 0;

  const shippingNote = document.querySelector("#shipping-note");
  if (subtotal === 0) {
    shippingNote.textContent = "Add something lovely to get started.";
  } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    shippingNote.textContent = "You've unlocked complimentary shipping.";
  } else {
    shippingNote.textContent = `You're ${money.format(FREE_SHIPPING_THRESHOLD - subtotal)} away from complimentary shipping.`;
  }

  if (entries.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span aria-hidden="true">♡</span>
        <p>Your bag is taking a little breather.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = entries
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="" />
          <div class="cart-item-details">
            <p class="cart-item-category">${product.category}</p>
            <h3 class="cart-item-name">${product.name}</h3>
            <p class="cart-item-price">${money.format(product.price)}</p>
            <div class="quantity-control" aria-label="Quantity for ${product.name}">
              <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease ${product.name} quantity">−</button>
              <span>${quantity}</span>
              <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase ${product.name} quantity">+</button>
            </div>
          </div>
          <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from bag">Remove</button>
        </article>
      `;
    })
    .join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function openCart() {
  renderCart();
  cartBackdrop.hidden = false;
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    cartBackdrop.classList.add("is-visible");
    cartDrawer.classList.add("is-open");
    document.querySelector("#close-cart").focus();
  });
}

function closeCart() {
  cartBackdrop.classList.remove("is-visible");
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains("is-open")) cartBackdrop.hidden = true;
  }, 260);
  document.querySelector("#open-cart").focus();
}

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (!addButton) return;

  const product = products.find((item) => item.id === addButton.dataset.add);
  cart.set(product.id, (cart.get(product.id) || 0) + 1);
  renderCart();
  showToast(`${product.name} added to your bag.`);
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (removeButton) {
    cart.delete(removeButton.dataset.remove);
    renderCart();
    return;
  }

  if (quantityButton) {
    const productId = quantityButton.dataset.quantity;
    const nextQuantity = (cart.get(productId) || 0) + Number(quantityButton.dataset.change);
    if (nextQuantity <= 0) cart.delete(productId);
    else cart.set(productId, nextQuantity);
    renderCart();
  }
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

document.querySelectorAll(".category-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category-button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    renderProducts();
  });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.navCategory;
    document.querySelectorAll(".category-button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.category === activeCategory);
    });
    renderProducts();
  });
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  if (cart.size > 0) showToast("Checkout is a demo. Your bag is ready!");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
});

renderProducts();
renderCart();