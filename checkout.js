import { apiFetch, getToken } from "./api.js";
import { getCart, updateQty, removeItem, clearCart, formatMoney, renderBadge } from "./cart.js";
import { setupTopbarAuthUI } from "./auth.js";

setupTopbarAuthUI();
renderBadge();

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutMsg = document.getElementById("checkoutMsg");

function renderCart() {
  const cart = getCart();
  if (cart.length === 0) {
    cartList.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    cartTotal.textContent = formatMoney(0);
    return;
  }

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((it) => {
    total += it.price * it.quantity;

    const row = document.createElement("div");
    row.className = "card";
    row.style.marginBottom = "12px";
    row.innerHTML = `
      <div class="row">
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${it.imageUrl}" alt="${it.title}" style="width:84px;height:64px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.08);" />
          <div>
            <strong>${it.title}</strong><br/>
            <span class="muted">${formatMoney(it.price)} each</span>
          </div>
        </div>

        <button class="btn danger" data-remove="1">Remove</button>
      </div>

      <div class="row" style="margin-top:10px;">
        <span class="muted">Quantity</span>
        <input type="number" min="1" value="${it.quantity}" style="max-width:120px; margin:0;" />
      </div>
    `;

    row.querySelector("[data-remove]").addEventListener("click", () => {
      removeItem(it.productId);
      renderBadge();
      renderCart();
    });

    row.querySelector("input").addEventListener("change", (e) => {
      const q = Math.max(1, Number(e.target.value || 1));
      updateQty(it.productId, q);
      renderBadge();
      renderCart();
    });

    cartList.appendChild(row);
  });

  cartTotal.textContent = formatMoney(total);
}

checkoutBtn.addEventListener("click", async () => {
  checkoutMsg.textContent = "";

  if (!getToken()) {
    checkoutMsg.textContent = "Please login first to place an order.";
    setTimeout(() => (location.href = "./login.html"), 800);
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    checkoutMsg.textContent = "Cart is empty.";
    return;
  }

  checkoutMsg.textContent = "Placing order...";
  try {
    const payload = {
      items: cart.map((it) => ({ productId: it.productId, quantity: it.quantity }))
    };
    const data = await apiFetch("/api/orders", { method: "POST", body: payload, auth: true });

    clearCart();
    renderBadge();
    renderCart();

    checkoutMsg.textContent = `Order placed successfully. Order ID: ${data.order.id}`;
  } catch (e) {
    checkoutMsg.textContent = `Checkout failed: ${e.message}`;
  }
});

renderCart();