const CART_KEY = "cart";

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function cartCount() {
  return getCart().reduce((sum, it) => sum + it.quantity, 0);
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((x) => x.productId === product.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId: product.id, title: product.title, price: product.price, imageUrl: product.imageUrl, quantity });
  saveCart(cart);
}

export function updateQty(productId, quantity) {
  const cart = getCart();
  const item = cart.find((x) => x.productId === productId);
  if (!item) return;
  item.quantity = quantity;
  saveCart(cart.filter((x) => x.quantity > 0));
}

export function removeItem(productId) {
  const cart = getCart().filter((x) => x.productId !== productId);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function renderBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = String(cartCount());
}