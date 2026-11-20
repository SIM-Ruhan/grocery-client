"use client";
import Link from "next/link";
import { useState } from "react";
import { useData, useStore } from "./Store";
import { Feedback } from "./Catalog";
import { Gate } from "./Auth";
import { api, newRequestId, taka } from "../lib/shop";
function Form({ params }) {
  const { bag, user, settings } = useStore(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [method, setMethod] = useState("cod");
  const buy = Boolean(params.product),
    product = useData(
      buy ? "products/" + encodeURIComponent(params.product) : null,
    );
  if (buy && !product.data)
    return <Feedback error={product.error} retry={product.reload} />;
  const rows = buy
    ? [
        {
          product: product.data,
          productId: params.product,
          size: params.size || "",
          qty: Number(params.qty || 1),
        },
      ]
    : bag;
  if (!rows.length)
    return (
      <div className="empty">
        Your cart is empty.{" "}
        <Link className="textbtn" href="/all-products">
          Browse groceries
        </Link>
      </div>
    );
  const invalid = rows.some(
    (r) =>
      !r.product?.active ||
      !Number.isInteger(r.qty) ||
      r.qty < 1 ||
      r.qty > Math.min(50, r.product.stock) ||
      (r.product.sizes.length
        ? !r.product.sizes.includes(r.size)
        : Boolean(r.size)),
  );
  if (invalid)
    return (
      <div className="panel narrow">
        <h1>Update your selection</h1>
        <p>The quantity or pack option is no longer available.</p>
        <Link
          className="btn"
          href={buy ? "/products/" + product.data._id : "/cart"}
        >
          Update selection
        </Link>
      </div>
    );
  const subtotal = rows.reduce(
    (n, r) => n + (r.product?.price || 0) * r.qty,
    0,
  );
  const shipping =
    subtotal >= settings.shipping.freeOver ? 0 : settings.shipping.fee;
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const field = Object.fromEntries(new FormData(e.target));
      delete field.method;
      const payload = {
        source: buy ? "buy" : "bag",
        method,
        items: rows.map(({ productId, size, qty }) => ({
          productId,
          size,
          qty,
        })),
        shipping: field,
      };
      const signature = JSON.stringify([user.id, payload]),
        previous = JSON.parse(
          sessionStorage.getItem("grove-checkout") || "null",
        );
      const requestKey =
        previous?.signature === signature ? previous.key : newRequestId();
      sessionStorage.setItem(
        "grove-checkout",
        JSON.stringify({ signature, key: requestKey }),
      );
      const result = await api("orders", "POST", { ...payload, requestKey });
      sessionStorage.removeItem("grove-checkout");
      location.assign(result.gatewayUrl || "/order-success/" + result.id);
    } catch (e) {
      if (
        [400, 409].includes(e.status) &&
        !e.message.includes("being prepared")
      )
        sessionStorage.removeItem("grove-checkout");
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <>
      <h1>Checkout</h1>
      <div className="checkoutgrid">
        <form className="form panel" onSubmit={submit}>
          <h2>Delivery details</h2>
          <label>
            Recipient name
            <input
              name="name"
              defaultValue={user.name}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Mobile number
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              pattern="(\+?88)?01[3-9][0-9]{8}"
              required
            />
          </label>
          <label>
            Street address
            <textarea
              name="address"
              autoComplete="street-address"
              required
              maxLength="300"
            />
          </label>
          <div className="formpair">
            <label>
              City / district
              <input name="city" autoComplete="address-level2" required />
            </label>
            <label>
              Postcode
              <input
                name="postcode"
                autoComplete="postal-code"
                inputMode="numeric"
                pattern="[0-9]{4}"
                required
              />
            </label>
          </div>
          <label>
            Delivery notes (optional)
            <textarea name="notes" maxLength="500" />
          </label>
          <fieldset>
            <legend>Payment method</legend>
            {[
              ["cod", "Cash on delivery"],
              ["online", "Online payment · SSLCOMMERZ"],
            ].map(([key, label]) => (
              <label key={key} className="radio">
                <input
                  type="radio"
                  name="method"
                  checked={method === key}
                  onChange={() => setMethod(key)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" disabled={busy}>
            {busy
              ? "Processing…"
              : method === "online"
                ? "Continue to secure payment"
                : "Place order"}
          </button>
        </form>
        <aside className="panel receipt">
          <h2>Order summary</h2>
          {rows.map((x) => (
            <div key={x.productId + x.size}>
              <span>
                {x.product?.name} {x.size || x.product?.unit} × {x.qty}
              </span>
              <b>{taka((x.product?.price || 0) * x.qty)}</b>
            </div>
          ))}
          <div>
            <span>Delivery</span>
            <b>{shipping ? taka(shipping) : "Free"}</b>
          </div>
          <div className="total">
            <span>Total</span>
            <b>{taka(subtotal + shipping)}</b>
          </div>
        </aside>
      </div>
    </>
  );
}
export function Checkout({ params }) {
  return (
    <div className="wrap page">
      <Gate>
        <Form params={params} />
      </Gate>
    </div>
  );
}
function Receipt({ id }) {
  const data = useData("orders/" + encodeURIComponent(id));
  const o = data.data;
  if (!o) return <Feedback error={data.error} retry={data.reload} />;
  const heading =
    o.payment === "Paid"
      ? "Payment successful"
      : o.status === "Cancelled"
        ? "Payment incomplete"
        : o.payment === "Awaiting payment"
          ? "Awaiting payment confirmation"
          : "Order received";
  return (
    <div className="panel narrow">
      <h1>{heading}</h1>
      <p>
        Order ID <b>{o._id}</b>
      </p>
      <div className="receipt">
        {o.items.map((x) => (
          <div key={x.productId + x.size}>
            <span>
              {x.name} {x.size || x.unit} × {x.qty}
            </span>
            <b>{taka(x.qty * x.price)}</b>
          </div>
        ))}
        <div>
          Delivery<b>{taka(o.delivery)}</b>
        </div>
        <div>
          Total<b>{taka(o.total)}</b>
        </div>
        <div>
          Payment<b>{o.payment}</b>
        </div>
      </div>
      {o.payment === "Awaiting payment" && (
        <button className="secondary" onClick={data.reload}>
          Refresh payment status
        </button>
      )}
      {o.status === "Cancelled" && (
        <p>
          <Link href="/all-products" className="textbtn">
            Return to groceries
          </Link>
        </p>
      )}
      <Link href="/dashboard?tab=Orders" className="btn">
        View my orders
      </Link>
    </div>
  );
}
export function Success({ id }) {
  return (
    <div className="wrap page">
      <Gate>
        <Receipt id={id} />
      </Gate>
    </div>
  );
}
