"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiFeather,
  FiHeadphones,
  FiPackage,
  FiPause,
  FiPlay,
  FiTag,
  FiTruck,
} from "react-icons/fi";
import { collection, taka } from "../lib/shop";
import { useData, useStore } from "./Store";
import { Feedback, Shelf } from "./Catalog";
const promos = [
  [
    "Offers",
    "Seasonal offers",
    "Seasonal promotional artwork from the supplied banner",
  ],
  ["Local", "Shop local", "Local delivery promotional artwork"],
  ["Best deals", "Best deals", "Selected weekly discount artwork"],
  [
    "Pantry",
    "Shop the pantry",
    "Pantry offers and everyday grocery essentials",
  ],
];
const slides = [
  {
    image: "vegetables",
    category: "Vegetables",
    title: "Fresh from\nthe vine.",
    alt: "Red vine tomatoes",
    cta: "Shop vegetables",
  },
  {
    image: "fruit",
    category: "Fruit",
    title: "A brighter\nfruit bowl.",
    alt: "Ripe oranges among green leaves",
    cta: "Shop fruit",
  },
  {
    image: "pantry",
    category: "Pantry",
    title: "Stock your\npantry.",
    alt: "Honey dripping into a glass jar",
    cta: "Shop the pantry",
  },
];
function Banners() {
  const [index, select] = useState(0),
    [paused, setPaused] = useState(false),
    [hover, setHover] = useState(false),
    [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || paused || hover || focused) return;
    const id = setInterval(() => select((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [paused, hover, focused, reduced]);
  const s = slides[index];
  return (
    <section
      className="hero-grid"
      aria-label="Grocery offers and featured categories"
    >
      {promos.map(([category, text, alt], i) => (
        <Link
          key={category}
          className={"promo promo-" + (i + 1)}
          href={collection(category)}
          aria-label={text}
        >
          <img
            src={"/media/promo-ref-" + (i + 1) + ".webp"}
            alt={alt}
            width="650"
            height="345"
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </Link>
      ))}
      <div
        className="hero-feature"
        aria-roledescription="carousel"
        aria-label="Seasonal spotlight"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
      >
        <Link
          href={collection(s.category)}
          className="feature-link"
          aria-label={s.cta}
        >
          <AnimatePresence initial={false}>
            <motion.img
              key={s.image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.32 }}
              src={"/media/hero-" + s.image + ".webp"}
              alt={s.alt}
              fetchPriority="high"
            />
          </AnimatePresence>
          <div className="feature-shade" />
          <div className="feature-copy">
            <span className="hero-kicker">Seasonal spotlight</span>
            <h1>{s.title}</h1>
            <span className="hero-cta">{s.cta}</span>
          </div>
        </Link>
        <div className="slider-controls">
          <div className="slide-dots">
            {slides.map((x, i) => (
              <button
                key={x.image}
                aria-label={"Show " + x.category + " banner"}
                aria-pressed={index === i}
                onClick={() => select(i)}
              >
                <span />
              </button>
            ))}
          </div>
          {/* <div className="slide-buttons">
            <button
              aria-label="Previous banner"
              onClick={() => select((index + 2) % 3)}
            >
              <FiChevronLeft />
            </button>
            {!reduced && (
              <button
                aria-label={paused ? "Play banners" : "Pause banners"}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <FiPlay /> : <FiPause />}
              </button>
            )}
            <button
              aria-label="Next banner"
              onClick={() => select((index + 1) % 3)}
            >
              <FiChevronRight />
            </button>
          </div> */}
        </div>
      </div>
    </section>
  );
}
function Marquee() {
  const { settings } = useStore(),
    [paused, setPaused] = useState(false);
  const policy = settings?.shipping;
  const shipping = !policy
    ? "Free Delivery"
    : policy.marqueeLabel
      ? "Free Delivery From " +
        policy.marqueeLabel +
        " (" +
        taka(policy.freeOver) +
        ")"
      : "Free Delivery From " + taka(policy.freeOver);
  const items = [
    [FiTag, "Low Prices Than in Other Stores"],
    [FiTruck, shipping],
    [FiFeather, "Fresh Products Every Day"],
    [FiCreditCard, "Safe Payment With Any Bank Card"],
    [FiHeadphones, "24/7 Support Always Be There for You"],
  ];
  return (
    <section
      className={"marquee " + (paused ? "is-paused" : "")}
      aria-label="Store services"
    >
      <div className="marquee-window">
        <div className="marquee-track">
          {[0, 1].map((rep) => (
            <div
              key={rep}
              className="marquee-group"
              aria-hidden={rep === 1 ? true : undefined}
            >
              {items.map(([Icon, label]) => (
                <span key={label}>
                  <Icon aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    
    </section>
  );
}
const brands = [
  ["teer", "Teer"],
  ["square-food", "Square Food & Beverage"],
  ["square-toiletries", "Square Toiletries"],
  ["dabur", "Dabur"],
  ["unilever", "Unilever"],
  ["beol", "Bangladesh Edible Oil"],
];
function MarketGuide() {
  return (
    <>
      <section className="guide px-2" aria-label="Customer services">
        <div className="guide-card">
          <span className="guide-icon">
            <FiTruck />
          </span>
          <div>
            <h3>Shipping &amp; delivery</h3>
            <p>Check delivery fees and payment options.</p>
          </div>
          <Link href="/help#delivery">Delivery info</Link>
        </div>
        <div className="guide-card">
          <span className="guide-icon">
            <FiPackage />
          </span>
          <div>
            <h3>Follow your order</h3>
            <p>Find your receipt and delivery status.</p>
          </div>
          <Link href="/dashboard?tab=Orders">My orders</Link>
        </div>
      </section>
      <section className="brands p-4">
        <div className="section-head">
          <h2>Grocery brands</h2>
        </div>
        <ul>
          {brands.map(([img, name]) => (
            <li key={img}>
              <img
                alt={name}
                src={"/media/brand-" + img + ".webp"}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
export default function Home({ initialProducts }) {
  const feed = useData(initialProducts ? null : "products"),
    products = initialProducts || feed.data;
  const categories = [...new Set((products || []).map((p) => p.category))];
  return (
    <>
      <div className="wrap">
        <Banners />
      </div>
      <Marquee />
      <div className="market-shelves p-5 xl:p-20">
        {products ? (
          <>
            <Shelf
              title="Popular picks"
              items={products.filter((p) => p.trending)}
              photo="/media/hero-vegetables.webp"
              caption="Shop the picks"
            />
            <Shelf
              title="New arrivals"
              items={products.filter((p) => p.newArrival)}
              photo="/media/hero-fruit.webp"
              theme="citrus"
              caption="Just in"
            />
            {categories.map((category) => {
              const group = products.filter((p) => p.category === category);
              return (
                <Shelf
                  key={category}
                  title={category}
                  items={group}
                  photo={group[0].image}
                  theme="forest"
                />
              );
            })}
            {!products.length && (
              <p className="empty">
                The grocery shelves are being stocked. Check back soon.
              </p>
            )}
          </>
        ) : (
          <Feedback error={feed.error} retry={feed.reload} />
        )}
        <MarketGuide />
      </div>
    </>
  );
}
