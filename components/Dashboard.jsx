"use client";
import Link from "next/link";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useStore, useData } from "./Store";
import { Gate } from "./Auth";
import { Feedback } from "./Catalog";
import { Bag } from "./Shopping";
import { api, taka } from "../lib/shop";
export function Workspace({ tabs, tab, admin, children }) {
  const { user, logout } = useStore(),
    base = admin ? "/admin" : "/dashboard";
  return (
    <div className="wrap workspace">
      <aside className="sidenav">
        <div>
          <small>{admin ? "STORE MANAGEMENT" : "MY ACCOUNT"}</small>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
        </div>
        <nav>
          {tabs.map((t) => (
            <Link
              key={t}
              aria-current={t === tab ? "page" : undefined}
              href={base + "?tab=" + encodeURIComponent(t)}
            >
              {t}
            </Link>
          ))}
        </nav>
        <button className="logout desktop-logout" onClick={logout}>
          <FiLogOut /> Log out
        </button>
      </aside>
      <section className="workbody">{children}</section>
      <button className="logout mobile-logout" onClick={logout}>
        <FiLogOut /> Log out
      </button>
    </div>
  );
}
export function OrderCard({ order: o, children }) {
  return (
    <article className="order">
      <div className="orderhead">
        <strong>{o._id}</strong>
        <span className="status">{o.status}</span>
      </div>
      <small>
        {new Date(o.createdAt).toLocaleDateString("en-GB")} ·{" "}
        {o.method === "cod" ? "Cash on delivery" : "Online payment"} ·{" "}
        {o.payment}
      </small>
      {o.items.map((x) => (
        <div className="orderline" key={x.productId + x.size}>
          <span>
            {x.name} {x.size} × {x.qty}
          </span>
          <b>{taka(x.price * x.qty)}</b>
        </div>
      ))}
      <div className="orderline">
        <span>Delivery</span>
        <b>{taka(o.delivery)}</b>
      </div>
      <div className="orderline">
        <strong>Total</strong>
        <b>{taka(o.total)}</b>
      </div>
      {children}
    </article>
  );
}
function ReviewForm({ o, item, reload }) {
  const [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = new FormData(e.target);
      await api("reviews", "POST", {
        orderId: o._id,
        productId: item.productId,
        rating: Number(d.get("rating")),
        text: d.get("text"),
      });
      reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form panel" onSubmit={send}>
      <h3>{item.name}</h3>
      <small>{o._id}</small>
      <label>
        Rating
        <select name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </label>
      <label>
        Your review
        <textarea name="text" required maxLength="1000" />
      </label>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
      <button className="btn" disabled={busy}>
        Submit review
      </button>
    </form>
  );
}
function Account({ initial }) {
  const tabs = ["Shopping cart", "Orders", "Waiting for review"],
    tab = tabs.includes(initial) ? initial : tabs[0];
  const feed = useData(tab === "Shopping cart" ? null : "orders");
  const pending = (feed.data || [])
    .filter((o) => o.status === "Delivered")
    .flatMap((o) =>
      [...new Map(o.items.map((x) => [x.productId, x])).values()]
        .filter((x) => !o.reviewed.includes(x.productId))
        .map((item) => ({ o, item })),
    );
  return (
    <Workspace tabs={tabs} tab={tab}>
      {tab === "Shopping cart" ? (
        <Bag />
      ) : (
        <>
          <h1>{tab}</h1>
          {!feed.data ? (
            <Feedback error={feed.error} retry={feed.reload} />
          ) : tab === "Orders" ? (
            feed.data.length ? (
              feed.data.map((o) => (
                <OrderCard key={o._id} order={o}>
                  <Link className="textbtn" href={"/order-success/" + o._id}>
                    Order details
                  </Link>
                </OrderCard>
              ))
            ) : (
              <p className="empty">No orders yet.</p>
            )
          ) : pending.length ? (
            pending.map(({ o, item }) => (
              <ReviewForm
                key={o._id + item.productId}
                o={o}
                item={item}
                reload={feed.reload}
              />
            ))
          ) : (
            <p className="empty">
              Your delivered purchases will appear here for review.
            </p>
          )}
        </>
      )}
    </Workspace>
  );
}
export default function Dashboard({ initial }) {
  return (
    <Gate>
      <Account initial={initial} />
    </Gate>
  );
}
