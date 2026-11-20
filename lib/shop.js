export const shopName = "Grove Market";
export const departments = ["Vegetables", "Fruit", "Pantry", "Dairy & eggs"];
export const navigation = [
  "Home",
  "All",
  "Offers",
  "New arrivals",
  "Best deals",
  "Local",
  "Exported",
];
export const taka = (value) =>
  "৳" +
  Number(value ?? 0).toLocaleString("en-BD", { maximumFractionDigits: 2 });
export const collection = (name) =>
  !name || name === "All"
    ? "/all-products"
    : name === "Home"
      ? "/"
      : "/all-products?collection=" + encodeURIComponent(name);
export const detail = (id) => "/products/" + encodeURIComponent(id);
export const buyLink = (id, qty = 1, size = "") =>
  "/checkout?" + new URLSearchParams({ product: id, qty: String(qty), size });
export function newRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Phones opening a local HTTP store can still generate a UUID with getRandomValues.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}
export function safeReturn(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return "/account";
  return value;
}
export async function api(path, method = "GET", body) {
  const response = await fetch("/api/" + path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.error?.message ||
      data.message ||
      (typeof data.error === "string" && data.error) ||
      "The store could not be reached. Please retry.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  return data;
}
export function matches(product, name) {
  switch (name) {
    case "":
    case undefined:
    case "All":
      return true;
    case "Offers":
    case "Best deals":
      return product.compareAt > product.price;
    case "New arrivals":
      return product.newArrival;
    case "Popular picks":
      return product.trending;
    case "Organic":
      return product.organic;
    default:
      return [
        product.category,
        product.origin,
        ...(product.collections || []),
      ].includes(name);
  }
}
export const discount = (p) =>
  p.compareAt > p.price ? Math.round(100 * (1 - p.price / p.compareAt)) : 0;
