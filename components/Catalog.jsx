"use client";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiShoppingCart,
} from "react-icons/fi";
import { collection, detail, discount, taka } from "../lib/shop";
import { useStore } from "./Store";

export function Feedback({ error, retry }) {
  return (
    <div className="feedback" role={error ? "alert" : "status"}>
      {error || "Loading…"}{" "}
      {error && retry && (
        <button className="textbtn" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  );
}
export function ProductCard({ p, quick = false }) {
  const { bag, ready, busy, change, setNotice } = useStore();
  const row = bag.find((x) => x.productId === p._id && x.size === "");
  const sale = discount(p),
    choosePack = p.sizes?.length > 0;
  const url = detail(p._id);
  async function update(delta) {
    try {
      await change(
        p,
        "",
        delta > 0 ? 1 : Math.max(0, row.qty - 1),
        delta > 0 ? "add" : "set",
      );
    } catch (e) {
      setNotice(e.message);
    }
  }
  return (
    <article className="pcard">
      <Link href={url} className="pc-photo" aria-label={"View " + p.name}>
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width="460"
          height="345"
        />
        {sale > 0 ? (
          <span className="product-tag">−{sale}%</span>
        ) : p.organic ? (
          <span className="product-tag organic-tag">Organic</span>
        ) : null}
      </Link>
      <div className="pc-body">
        <p className="pc-unit">{p.unit}</p>
        <h3>
          <Link href={url}>{p.name}</Link>
        </h3>
        <p className="price">
          {taka(p.price)} {sale > 0 && <del>{taka(p.compareAt)}</del>}
        </p>
        {quick ? (
          choosePack ? (
            <Link href={url} className="pc-action">
              <FiShoppingCart />
              Add to cart
            </Link>
          ) : row?.qty > 0 ? (
            <div className="quick-step">
              <button
                disabled={busy}
                onClick={() => update(-1)}
                aria-label={"Remove one " + p.name}
              >
                <FiMinus />
              </button>
              <span>{row.qty} in cart</span>
              <button
                disabled={busy || row.qty >= Math.min(p.stock, 50)}
                onClick={() => update(1)}
                aria-label={"Add one " + p.name}
              >
                <FiPlus />
              </button>
            </div>
          ) : (
            <button
              className="pc-action"
              disabled={!ready || busy || !p.stock}
              onClick={() => update(1)}
            >
              <FiPlus />
              {p.stock ? "Add to cart" : "Sold out"}
            </button>
          )
        ) : (
          <Link className="pc-action detail-action" href={url}>
            View details
          </Link>
        )}
      </div>
    </article>
  );
}
export function Cards({
  items,
  empty = "No products in this collection yet.",
  quick = false,
}) {
  if (!items.length) return <p className="empty">{empty}</p>;
  return (
    <div className="cards">
      {items.map((p) => (
        <ProductCard p={p} quick={quick} key={p._id} />
      ))}
    </div>
  );
}
export function Shelf({
  title,
  items,
  photo,
  theme = "leaf",
  caption = "Shop collection",
}) {
  const track = useRef(null),
    [position, setPosition] = useState({ start: true, end: false });
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setPosition({
        start: el.scrollLeft < 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [items.length]);
  function slide(dir) {
    const el = track.current;
    el.scrollBy({
      left: dir * el.clientWidth * 0.82,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  if (!items.length) return null;
  return (
    <section className="shelf" aria-label={title}>
      <div className="section-head">
        <h2>{title}</h2>
        <div className="shelf-tools">
          <Link className="viewall" href={collection(title)}>
            See all
          </Link>
          {!(position.start && position.end) && (
            <div className="shelf-arrows">
              <button
                disabled={position.start}
                onClick={() => slide(-1)}
                aria-label={"Previous " + title}
              >
                <FiChevronLeft />
              </button>
              <button
                disabled={position.end}
                onClick={() => slide(1)}
                aria-label={"More " + title}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="shelf-track" ref={track}>
        <Link className={"shelf-intro " + theme} href={collection(title)}>
          <img src={photo} alt="" loading="lazy" />
          <div>
            <strong>{title}</strong>
            <span>{caption}</span>
          </div>
        </Link>
        {items.slice(0, 10).map((p) => (
          <ProductCard key={p._id} p={p} quick />
        ))}
      </div>
    </section>
  );
}
