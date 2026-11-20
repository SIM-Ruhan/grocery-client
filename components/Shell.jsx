"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PiPlantFill } from "react-icons/pi";
import {
  FiChevronDown,
  FiFacebook,
  FiGrid,
  FiHome,
  FiInstagram,
  FiLock,
  FiMail,
  FiMapPin,
  FiMenu,
  FiPhone,
  FiSearch,
  FiShoppingCart,
  FiTag,
  FiUser,
} from "react-icons/fi";
import { useStore } from "./Store";
import { collection, departments, navigation, taka } from "../lib/shop";

export function Wordmark() {
  return (
    <Link href="/" className="wordmark" aria-label="Grove Market home">
      <span className="brandmark">
        <PiPlantFill aria-hidden="true" />
      </span>
      <span>
        Grove<span className="brandtype">Market</span>
      </span>
    </Link>
  );
}
function useDismiss(ref, close) {
  useEffect(() => {
    function outside(e) {
      if (!ref.current?.contains(e.target)) close();
    }
    function escape(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [ref, close]);
}
export function Header() {
  const { user, bag, ready, logout } = useStore();
  const [menu, setMenu] = useState(""),
    [query, setQuery] = useState("");
  const header = useRef(null),
    router = useRouter(),
    path = usePathname();
  const close = () => setMenu("");
  useDismiss(header, close);
  useEffect(() => setMenu(""), [path]);
  const count = bag.reduce((n, line) => n + line.qty, 0);
  function search(e) {
    e.preventDefault();
    close();
    router.push(
      "/all-products" +
        (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""),
    );
  }
  return (
    <header ref={header} className="masthead">
      <div className="wrap mast">
        <Wordmark />
        <form className="search" role="search" onSubmit={search}>
          <FiSearch aria-hidden="true" />
          <input
            aria-label="Search groceries"
            type="search"
            placeholder="Search fresh groceries, fruit, pantry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button>Search</button>
        </form>
        <div className="actions">
          {ready && user ? (
            <div className="account">
              <button
                className="profile"
                onClick={() => setMenu(menu === "account" ? "" : "account")}
                aria-expanded={menu === "account"}
                aria-label="Open account menu"
              >
                <span className="avatar">
                  {user.image ? (
                    <img src={user.image} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    user.name?.slice(0, 1).toUpperCase()
                  )}
                </span>
                <FiChevronDown />
              </button>
              {menu === "account" && (
                <div className="dropdown profile-menu">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                  <Link
                    onClick={close}
                    href={user.admin ? "/admin" : "/dashboard"}
                  >
                    Dashboard
                  </Link>
                  <button onClick={logout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="signin" href="/sign-in">
                <FiUser aria-hidden="true" />
                Sign in
              </Link>
              <Link className="signup" href="/sign-up">
                Sign up
              </Link>
            </>
          )}
          <Link
            className="cartlink"
            href="/cart"
            aria-label={"Cart, " + count + (count === 1 ? " item" : " items")}
          >
            <FiShoppingCart aria-hidden="true" />
            <b>{count}</b>
          </Link>
        </div>
      </div>
      <nav className="category-nav" aria-label="Store categories">
        <div className="wrap navshell">
          <div className="department-menu">
            <button
              className="department-toggle"
              aria-expanded={menu === "departments"}
              onClick={() =>
                setMenu(menu === "departments" ? "" : "departments")
              }
            >
              <FiMenu />
              Departments
              <FiChevronDown />
            </button>
            {menu === "departments" && (
              <div className="dropdown departments">
                {[...departments, "Organic"].map((name) => (
                  <Link key={name} onClick={close} href={collection(name)}>
                    {name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="navlinks">
            {navigation.map((n) => (
              <Link
                key={n}
                className={n === "Offers" ? "offer-link" : ""}
                href={collection(n)}
                onClick={close}
                aria-current={n === "Home" && path === "/" ? "page" : undefined}
              >
                {n === "Offers" && <FiTag aria-hidden="true" />}
                {n}
              </Link>
            ))}
          </div>
          <span className="locality">
            <FiMapPin aria-hidden="true" /> Bangladesh
          </span>
        </div>
      </nav>
    </header>
  );
}
export function CartNavigation() {
  const { bag, user } = useStore(),
    path = usePathname();
  const count = bag.reduce((n, r) => n + r.qty, 0);
  const subtotal = bag.reduce(
    (sum, r) => sum + (r.product?.price || 0) * r.qty,
    0,
  );
  const account = user?.admin ? "/admin" : user ? "/dashboard" : "/sign-in";
  const links = [
    ["Home", "/", FiHome],
    ["Browse", "/all-products", FiGrid],
    ["Search", "/all-products?focus=search", FiSearch],
    ["Cart", "/cart", FiShoppingCart],
    ["Account", account, FiUser],
  ];
  return (
    <>
      <Link
        className="sidecart"
        href="/cart"
        aria-label={
          "Open cart, " +
          count +
          (count === 1 ? " item, " : " items, ") +
          taka(subtotal)
        }
      >
        <FiShoppingCart />
        <span>
          {count} {count === 1 ? "item" : "items"}
        </span>
        <b>{taka(subtotal)}</b>
      </Link>
      <nav className="bottomnav" aria-label="Mobile navigation">
        {links.map(([name, href, Icon]) => (
          <Link
            href={href}
            key={name}
            aria-current={path === href ? "page" : undefined}
          >
            <span>
              <Icon aria-hidden="true" />
              {name === "Cart" && <b>{count}</b>}
            </span>
            {name}
          </Link>
        ))}
      </nav>
    </>
  );
}
const contact = {
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS,
};
export function Footer() {
  const socials = [
    [process.env.NEXT_PUBLIC_FACEBOOK_URL, FiFacebook, "Facebook"],
    [process.env.NEXT_PUBLIC_INSTAGRAM_URL, FiInstagram, "Instagram"],
  ].filter(([url]) => url);
  return (
    <footer className="footer">
      <div className="wrap footgrid">
        <section>
          <Wordmark />
          <p>
            Fresh produce and pantry essentials for kitchens across Bangladesh.
          </p>
        </section>
        <section>
          <h3>Quick links</h3>
          <Link href="/all-products">All products</Link>
          <Link href={collection("Offers")}>Offers</Link>
          <Link href={collection("New arrivals")}>New arrivals</Link>
          <Link href={collection("Local")}>Local groceries</Link>
        </section>
        <section>
          <h3>Customer service</h3>
          <Link href="/help#delivery">Shipping &amp; delivery</Link>
          <Link href="/dashboard?tab=Orders">Track an order</Link>
          <Link href="/help#faq">Frequently asked questions</Link>
          <Link href="/account">My account</Link>
        </section>
        <section>
          <h3>Contact us</h3>
          {contact.email && (
            <a href={"mailto:" + contact.email}>
              <FiMail />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={"tel:" + contact.phone}>
              <FiPhone />
              {contact.phone}
            </a>
          )}
          <span className="foot-location">
            <FiMapPin />
            {contact.address || "Bangladesh"}
          </span>
          <Link href="/help#contact">Customer care</Link>
          {socials.length > 0 && (
            <div className="socials">
              {socials.map(([url, Icon, name]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="wrap copyright">
        <span>© {new Date().getFullYear()} Grove Market</span>
        <span>
          <FiLock /> SSLCOMMERZ <i>·</i> Cash on delivery
        </span>
      </div>
    </footer>
  );
}
