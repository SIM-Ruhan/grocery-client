"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
} from "react-icons/fi";
import { useData, useStore } from "./Store";
import { Cards, Feedback } from "./Catalog";
import {
  buyLink,
  collection,
  departments,
  detail,
  discount,
  matches,
  taka,
} from "../lib/shop";

export function Browse({ params }) {
  const { data, error, reload } = useData("products");
  const router = useRouter(),
    input = useRef(null);
  const textParam = (key) =>
    typeof params[key] === "string" ? params[key] : "";
  const shelf = textParam("collection"),
    q = textParam("q"),
    origin = textParam("origin"),
    category = textParam("category"),
    sort = textParam("sort");
  const stock = params.stock === "yes",
    organic = params.organic === "yes",
    searchFocus = params.focus === "search";
  useEffect(() => {
    if (searchFocus) input.current?.focus();
  }, [searchFocus, params]);
  function filter(key, value) {
    const next = new URLSearchParams(window.location.search);
    next.delete("focus");
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace("/all-products" + (next.size ? "?" + next : ""), {
      scroll: false,
    });
  }
  const all = data || [];
  const catalog = [...new Set([...departments, ...all.map((p) => p.category)])];
  const collections = [
    ...new Set([
      "Popular picks",
      "New arrivals",
      "Offers",
      "Best deals",
      "Organic",
      ...all.flatMap((p) => p.collections || []),
      ...(shelf ? [shelf] : []),
    ]),
  ];
  const term = q.trim().toLocaleLowerCase();
  const items = all.filter(
    (p) =>
      matches(p, shelf) &&
      (!category || category === p.category) &&
      (!origin || p.origin === origin) &&
      (!stock || p.stock > 0) &&
      (!organic || p.organic) &&
      [
        p.name,
        p.category,
        p.origin,
        p.unit,
        p.details,
        ...(p.collections || []),
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
  );
  if (sort === "low") items.sort((a, b) => a.price - b.price);
  if (sort === "high") items.sort((a, b) => b.price - a.price);
  if (sort === "saving" || (!sort && shelf === "Best deals"))
    items.sort((a, b) => discount(b) - discount(a));
  return (
    <div className="wrap page browse">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight />
        Shop
      </nav>
      <h1>{shelf || "All products"}</h1>
      <form
        className="catalogsearch"
        key={q}
        onSubmit={(e) => {
          e.preventDefault();
          filter("q", input.current.value.trim());
        }}
      >
        <input
          ref={input}
          type="search"
          aria-label="Search all products"
          name="q"
          defaultValue={q}
          placeholder="Search the grocery shelves…"
        />
        <button className="btn">Search</button>
      </form>
      <div className="filters">
        <label>
          Collection
          <select
            value={shelf}
            onChange={(e) => filter("collection", e.target.value)}
          >
            <option value="">All collections</option>
            {collections.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => filter("category", e.target.value)}
          >
            <option value="">All categories</option>
            {catalog.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Origin
          <select
            value={origin}
            onChange={(e) => filter("origin", e.target.value)}
          >
            <option value="">Any origin</option>
            <option>Local</option>
            <option>Exported</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => filter("sort", e.target.value)}>
            <option value="">
              {shelf === "Best deals" ? "Best savings" : "Latest first"}
            </option>
            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
            <option value="saving">Biggest saving</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={stock}
            onChange={(e) => filter("stock", e.target.checked ? "yes" : "")}
          />
          In stock
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={organic}
            onChange={(e) => filter("organic", e.target.checked ? "yes" : "")}
          />
          Organic
        </label>
        <Link className="textbtn" href="/all-products">
          Reset
        </Link>
      </div>
      {data ? (
        <>
          <p className="count" aria-live="polite">
            {items.length} {items.length === 1 ? "product" : "products"}
            {q ? " for “" + q + "”" : ""}
          </p>
          <Cards items={items} empty="No products match these filters." />
        </>
      ) : (
        <Feedback error={error} retry={reload} />
      )}
    </div>
  );
}
export function Purchase({ product: p }) {
  const { change, ready, busy } = useStore(),
    router = useRouter();
  const [qty, setQty] = useState(1),
    [size, setSize] = useState(""),
    [message, setMessage] = useState("");
  async function act(buy) {
    setMessage("");
    if (p.sizes?.length && !size) {
      setMessage("Choose a pack option first.");
      return;
    }
    if (buy) {
      router.push(buyLink(p._id, qty, size));
      return;
    }
    try {
      await change(p, size, qty);
    } catch (e) {
      setMessage(e.message);
    }
  }
  return (
    <div className="purchase">
      {p.sizes?.length > 0 && (
        <fieldset>
          <legend>Pack option</legend>
          <div className="sizes">
            {p.sizes.map((s) => (
              <button
                key={s}
                aria-pressed={s === size}
                className={s === size ? "selected" : ""}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="quantity-line">
        <span>Quantity</span>
        <div className="stepper">
          <button
            aria-label="Decrease quantity"
            disabled={qty <= 1}
            onClick={() => setQty(qty - 1)}
          >
            <FiMinus />
          </button>
          <output>{qty}</output>
          <button
            aria-label="Increase quantity"
            disabled={qty >= Math.min(p.stock, 50)}
            onClick={() => setQty(qty + 1)}
          >
            <FiPlus />
          </button>
        </div>
        <span className="stock">
          {p.stock > 0 ? (
            <>
              <FiCheck /> In stock · {p.stock}
            </>
          ) : (
            "Sold out"
          )}
        </span>
      </div>
      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
      <div className="buttonrow">
        <button
          className="btn"
          disabled={!ready || busy || !p.stock}
          onClick={() => act(false)}
        >
          <FiShoppingCart />
          Add to cart
        </button>
        <button
          className="secondary"
          disabled={!ready || busy || !p.stock}
          onClick={() => act(true)}
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
export function Product({ product: p }) {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FiChevronRight />
        <Link href={collection(p.category)}>{p.category}</Link>
        <FiChevronRight />
        {p.name}
      </nav>
      <div className="productlayout">
        <div className="detailphoto">
          <img src={p.image} alt={p.name} />
        </div>
        <section className="productinfo">
          <p className="product-meta">
            {p.category} · {p.origin}
            {p.organic ? " · Organic" : ""}
          </p>
          <h1>{p.name}</h1>
          <p className="pack-unit">{p.unit}</p>
          <p className="price large">
            {taka(p.price)}{" "}
            {discount(p) > 0 && (
              <>
                <del>{taka(p.compareAt)}</del>
                <span className="inline-sale">Save {discount(p)}%</span>
              </>
            )}
          </p>
          <p className="desc">{p.details}</p>
          <Purchase product={p} />
          <Link href="/cart" className="textbtn">
            View shopping cart
          </Link>
        </section>
      </div>
      <section className="detail-reviews">
        <h2>Customer reviews</h2>
        {p.reviews.length ? (
          p.reviews.map((r) => (
            <article className="review" key={r._id}>
              <b>
                {r.name} · {r.rating}/5
              </b>
              <p>{r.text}</p>
            </article>
          ))
        ) : (
          <p className="empty">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
export function Bag() {
  const { bag, ready, busy, change, settings, sessionError, refresh } =
    useStore();
  const [error, setError] = useState("");
  if (!ready || sessionError)
    return <Feedback error={sessionError} retry={refresh} />;
  const subtotal = bag.reduce((n, x) => n + (x.product?.price || 0) * x.qty, 0);
  const blocked = bag.some(
    (r) => !r.product?.active || r.qty > r.product.stock,
  );
  async function update(row, qty) {
    setError("");
    try {
      await change(
        row.product || { _id: row.productId, stock: 0 },
        row.size,
        qty,
        "set",
      );
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="cart-page">
      <h1>Shopping cart</h1>
      {bag.length ? (
        <>
          <div className="bagrows">
            {bag.map((row) => (
              <article className="bagrow" key={row.productId + ":" + row.size}>
                {row.product?.image && <img src={row.product.image} alt="" />}
                <div>
                  <Link href={detail(row.productId)}>
                    <b>{row.product?.name || "Unavailable product"}</b>
                  </Link>
                  <small>
                    {row.size || row.product?.unit} · {taka(row.product?.price)}
                    {!row.product?.active || row.qty > row.product.stock
                      ? " · Check availability"
                      : ""}
                  </small>
                </div>
                <div className="stepper">
                  <button
                    disabled={busy || row.qty <= 1}
                    aria-label="Decrease quantity"
                    onClick={() => update(row, row.qty - 1)}
                  >
                    <FiMinus />
                  </button>
                  <span>{row.qty}</span>
                  <button
                    disabled={
                      busy || row.qty >= Math.min(row.product?.stock || 0, 50)
                    }
                    aria-label="Increase quantity"
                    onClick={() => update(row, row.qty + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>
                <button
                  disabled={busy}
                  className="icon"
                  aria-label={"Remove " + row.product?.name}
                  onClick={() => update(row, 0)}
                >
                  <FiTrash2 />
                </button>
              </article>
            ))}
          </div>
          <div className="summary panel">
            <div>
              Subtotal<b>{taka(subtotal)}</b>
            </div>
            {settings && (
              <div>
                Delivery
                <b>
                  {subtotal >= settings.shipping.freeOver
                    ? "Free"
                    : taka(settings.shipping.fee)}
                </b>
              </div>
            )}
            {blocked ? (
              <p className="error">Update unavailable items to continue.</p>
            ) : (
              <Link className="btn" href="/checkout">
                Continue to checkout
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="empty">
          <p>Your cart is empty.</p>
          <Link className="textbtn" href="/all-products">
            Browse groceries
          </Link>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
