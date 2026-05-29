import { apiFetch } from "./api.js";
import { addToCart, formatMoney, renderBadge } from "./cart.js";
import { setupTopbarAuthUI } from "./auth.js";

setupTopbarAuthUI();
renderBadge();

const wrap = document.getElementById("productWrap");
const params = new URLSearchParams(location.search);
const id = params.get("id");

async function init() {
  wrap.innerHTML = `<p class="muted">Loading...</p>`;
  try {
    const { product } = await apiFetch(`/api/products/${id}`);
    wrap.innerHTML = `
      <div class="card">
        <img class="product-img" style="height:260px;" src="${product.imageUrl}" alt="${product.title}">
        <h1 style="margin-bottom:6px;">${product.title}</h1>
        <p class="muted">${product.description}</p>
        <div class="row">
          <strong style="font-size:20px;">${formatMoney(product.price)}</strong>
          <span class="muted">Stock: ${product.stock}</span>
        </div>

        <div class="row" style="margin-top:12px;">
          <input id="qty" type="number" min="1" value="1" style="max-width:120px; margin:0;" />
          <button id="addBtn" class="btn primary" ${product.stock <= 0 ? "disabled" : ""}>Add to Cart</button>
        </div>
        <p class="muted" id="msg"></p>
      </div>
    `;

    const qtyEl = document.getElementById("qty");
    const btn = document.getElementById("addBtn");
    const msg = document.getElementById("msg");

    btn.addEventListener("click", () => {
      const q = Math.max(1, Number(qtyEl.value || 1));
      addToCart(product, q);
      renderBadge();
      msg.textContent = "Added to cart.";
    });
  } catch (e) {
    wrap.innerHTML = `<p class="muted">Error: ${e.message}</p>`;
  }
}

init();
