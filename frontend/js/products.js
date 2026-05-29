import { apiFetch } from "./api.js";
import { addToCart, formatMoney, renderBadge } from "./cart.js";
import { setupTopbarAuthUI } from "./auth.js";

setupTopbarAuthUI();
renderBadge();

const grid = document.getElementById("productsGrid");

function productCard(p) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img class="product-img" src="${p.imageUrl}" alt="${p.title}">
    <h3>${p.title}</h3>
    <p class="muted">${p.description}</p>
    <div class="row">
      <strong>${formatMoney(p.price)}</strong>
      <span class="muted">Stock: ${p.stock}</span>
    </div>
    <div class="row" style="margin-top:10px;">
      <a class="btn" href="./product.html?id=${p.id}">View Details</a>
      <button class="btn primary" ${p.stock <= 0 ? "disabled" : ""}>Add to Cart</button>
    </div>
  `;
  div.querySelector("button").addEventListener("click", () => {
    addToCart(p, 1);
    renderBadge();
  });
  return div;
}

async function init() {
  grid.innerHTML = `<p class="muted">Loading...</p>`;
  try {
    const data = await apiFetch("/api/products");
    grid.innerHTML = "";
    data.products.forEach((p) => grid.appendChild(productCard(p)));
  } catch (e) {
    grid.innerHTML = `<p class="muted">Error: ${e.message}</p>`;
  }
}

init();
