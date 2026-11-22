"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiSliders,
  FiX,
} from "react-icons/fi";
import { FaChevronRight } from "react-icons/fa";
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

export function Browse({ params = {} }) {
  const { data, error, reload } = useData("products");
  const router = useRouter();
  const input = useRef(null);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const textParam = (key) =>
    typeof params[key] === "string" ? params[key] : "";

  const shelf = textParam("collection");
  const q = textParam("q");
  const origin = textParam("origin");
  const category = textParam("category");
  const sort = textParam("sort");

  const stock = params.stock === "yes";
  const organic = params.organic === "yes";
  const searchFocus = params.focus === "search";

  useEffect(() => {
    if (searchFocus) {
      input.current?.focus();
    }
  }, [searchFocus, params]);

  function filter(key, value) {
    const next = new URLSearchParams(window.location.search);

    next.delete("focus");

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    router.replace(
      `/all-products${next.size ? `?${next.toString()}` : ""}`,
      { scroll: false },
    );
  }

  const all = data || [];

  const catalog = [
    ...new Set([
      ...departments,
      ...all.map((product) => product.category),
    ]),
  ];

  const collections = [
    ...new Set([
      "Popular picks",
      "New arrivals",
      "Offers",
      "Best deals",
      "Organic",
      ...all.flatMap((product) => product.collections || []),
      ...(shelf ? [shelf] : []),
    ]),
  ];

  const activeFilterCount = [
    shelf,
    category,
    origin,
    sort,
    stock,
    organic,
  ].filter(Boolean).length;

  const term = q.trim().toLocaleLowerCase();

  const items = all.filter((product) => {
    const searchableText = [
      product.name,
      product.category,
      product.origin,
      product.unit,
      product.details,
      ...(product.collections || []),
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      matches(product, shelf) &&
      (!category || category === product.category) &&
      (!origin || origin === product.origin) &&
      (!stock || product.stock > 0) &&
      (!organic || product.organic) &&
      searchableText.includes(term)
    );
  });

  if (sort === "low") {
    items.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    items.sort((a, b) => b.price - a.price);
  }

  if (sort === "saving" || (!sort && shelf === "Best deals")) {
    items.sort((a, b) => discount(b) - discount(a));
  }

  const labelClass =
    "flex min-w-0 flex-col gap-1.5 text-sm font-medium text-[var(--ink)]";

  const selectClass =
    "min-h-11 w-full min-w-0 rounded-lg border border-[#c2c7bb] " +
    "bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none " +
    "transition focus:border-[var(--forest)] focus:ring-2 " +
    "focus:ring-[var(--forest)]/15 md:w-auto md:min-w-[145px]";

  return (
    <main className="w-full overflow-x-clip px-0 py-6 md:py-12">
      {/* Breadcrumb */}
      <nav
        className="mb-3 flex flex-wrap items-center gap-2 text-xs text-(--muted) md:mb-4 md:text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="transition hover:text-(--forest) hover:underline"
        >
          Home
        </Link>

        <FiChevronRight className="text-xs" />

        <span>Shop</span>
      </nav>

      {/* Smaller mobile title */}
      <h1 className="text-[2rem]! leading-tight! md:text-[clamp(2.4rem,4.4vw,4.05rem)]!">
        {shelf || "All products"}
      </h1>

      {/* Search */}
      <form
        className="my-4 flex w-full max-w-[620px] items-stretch gap-2 md:my-6"
        key={q}
        onSubmit={(event) => {
          event.preventDefault();
          filter("q", input.current?.value.trim() || "");
        }}
      >
        <input
          ref={input}
          type="search"
          name="q"
          defaultValue={q}
          aria-label="Search all products"
          placeholder="Search the grocery shelves…"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-[#c2c7bb] bg-white px-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[#7b897d] focus:border-[var(--forest)] focus:ring-2 focus:ring-[var(--forest)]/15"
        />

        <button
          type="submit"
          className="min-h-11 shrink-0 rounded-lg border border-[#b9cbb2] bg-transparent px-3.5 text-sm font-semibold text-[var(--forest)] transition hover:border-[var(--forest)] hover:bg-white sm:px-5"
        >
          Search
        </button>
      </form>

      {/* Mobile filter button */}
      <button
        type="button"
        aria-expanded={filtersOpen}
        aria-controls="mobile-product-filters"
        onClick={() => setFiltersOpen((current) => !current)}
        className="flex min-h-11 w-full items-center justify-between rounded-lg border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--forest)] shadow-sm transition hover:border-[#abc09f] md:hidden"
      >
        <span className="flex items-center gap-2">
          {filtersOpen ? (
            <FiX className="text-xl" />
          ) : (
            <FiSliders className="text-xl" />
          )}

          {filtersOpen ? "Close filters" : "Filters"}
        </span>

        {activeFilterCount > 0 && (
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--forest)] px-1.5 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filters */}
      <div
        id="mobile-product-filters"
        className={`
          ${
            filtersOpen
              ? "mt-3 grid"
              : "hidden"
          }
          grid-cols-1 gap-3 rounded-xl border border-[var(--line)]
          bg-white p-4 shadow-sm
          sm:grid-cols-2
          md:mt-0 md:flex md:flex-wrap md:items-end md:gap-3
          md:rounded-none md:border-x-0 md:border-y md:bg-transparent
          md:px-0 md:py-4 md:shadow-none
        `}
      >
        <label className={labelClass}>
          Collection

          <select
            value={shelf}
            className={selectClass}
            onChange={(event) =>
              filter("collection", event.target.value)
            }
          >
            <option value="">All collections</option>

            {collections.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Category

          <select
            value={category}
            className={selectClass}
            onChange={(event) =>
              filter("category", event.target.value)
            }
          >
            <option value="">All categories</option>

            {catalog.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Origin

          <select
            value={origin}
            className={selectClass}
            onChange={(event) =>
              filter("origin", event.target.value)
            }
          >
            <option value="">Any origin</option>
            <option value="Local">Local</option>
            <option value="Exported">Exported</option>
          </select>
        </label>

        <label className={labelClass}>
          Sort by

          <select
            value={sort}
            className={selectClass}
            onChange={(event) =>
              filter("sort", event.target.value)
            }
          >
            <option value="">
              {shelf === "Best deals"
                ? "Best savings"
                : "Latest first"}
            </option>

            <option value="low">Price, low to high</option>
            <option value="high">Price, high to low</option>
            <option value="saving">Biggest saving</option>
          </select>
        </label>

        <div className="flex min-h-11 flex-wrap items-center gap-5 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={stock}
              onChange={(event) =>
                filter(
                  "stock",
                  event.target.checked ? "yes" : "",
                )
              }
              className="h-4 w-4 cursor-pointer accent-[var(--forest)]"
            />

            In stock
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={organic}
              onChange={(event) =>
                filter(
                  "organic",
                  event.target.checked ? "yes" : "",
                )
              }
              className="h-4 w-4 cursor-pointer accent-[var(--forest)]"
            />

            Organic
          </label>
        </div>

        <Link
          href="/all-products"
          onClick={() => setFiltersOpen(false)}
          className="flex min-h-11 items-center justify-center border-t border-[var(--line)] pt-3 text-sm font-semibold text-[var(--forest)] underline decoration-[#8ba281] underline-offset-4 sm:col-span-2 md:border-0 md:px-2 md:pt-0"
        >
          Reset filters
        </Link>
      </div>

      {/* Product results */}
      {data ? (
        <>
          <p
            className="my-4 text-sm text-(--muted)"
            aria-live="polite"
          >
            {items.length}{" "}
            {items.length === 1 ? "product" : "products"}

            {q ? ` for “${q}”` : ""}
          </p>

          <Cards
            items={items}
            empty="No products match these filters."
          />
        </>
      ) : (
        <Feedback error={error} retry={reload} />
      )}
    </main>
  );
}
export function Purchase({ product: p }) {
  const router = useRouter();
  const { bag, change, ready, busy } = useStore();
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");

  const sizes = p.sizes || [];
  const needsSize = sizes.length > 0 && !size;
  const productRows = bag.filter((row) => row.productId === p._id);
  const qty = productRows.find((row) => row.size === size)?.qty ?? 0;
  const totalInCart = productRows.reduce((sum, row) => sum + row.qty, 0);
  const locked = !ready || busy;
  const canAdd = !locked && totalInCart < p.stock && qty < 50;

  function packSelected() {
    if (needsSize) {
      setMessage("Choose a pack option first.");
      return false;
    }
    setMessage("");
    return true;
  }

  async function updateCart(delta) {
    if (!packSelected()) return;

    try {
      if (delta > 0) {
        await change(p, size, 1, "add");
      } else if (qty > 0) {
        await change(p, size, qty - 1, "set");
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  function buyNow() {
    if (packSelected()) {
      router.push(buyLink(p._id, Math.max(1, qty), size));
    }
  }

  return (
    <div className="purchase">
      {sizes.length > 0 && (
        <fieldset>
          <legend>Pack option</legend>
          <div className="sizes">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={option === size}
                className={option === size ? "selected" : ""}
                disabled={busy}
                onClick={() => {
                  setSize(option);
                  setMessage("");
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="quantity-line">
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

      <div className="buttonrow">
        {qty > 0 ? (
          <div
            className="quick-step"
            role="group"
            aria-label={`Cart quantity for ${p.name}${size ? `, ${size}` : ""}`}
            style={{ minWidth: 165, marginTop: 0 }}
          >
            <button
              type="button"
              aria-label={`Remove one ${p.name}`}
              disabled={locked}
              onClick={() => updateCart(-1)}
            >
              <FiMinus />
            </button>

            <span aria-live="polite">{qty} in cart</span>

            <button
              type="button"
              aria-label={`Add one ${p.name}`}
              disabled={!canAdd}
              onClick={() => updateCart(1)}
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="pc-action"
            style={{ minWidth: 165, marginTop: 0 }}
            disabled={!canAdd}
            onClick={() => updateCart(1)}
          >
            <FiPlus />
            {p.stock > 0 ? "Add to cart" : "Sold out"}
          </button>
        )}

        <button
          type="button"
          className="secondary"
          disabled={locked || p.stock < Math.max(1, qty)}
          onClick={buyNow}
        >
          Buy now
        </button>
      </div>

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
export function Product({ product: p }) {
  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <FaChevronRight />
        <Link href={collection(p.category)}>{p.category}</Link>
        <FaChevronRight />
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
