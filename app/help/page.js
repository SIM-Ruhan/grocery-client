import Link from "next/link";
import { getPublic } from "../../lib/public-api";
import { taka } from "../../lib/shop";
export const dynamic = "force-dynamic";
export const metadata = { title: "Customer care" };
export default async function Help() {
  const config = await getPublic("settings").catch(() => null),
    email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    phone = process.env.NEXT_PUBLIC_SUPPORT_PHONE;
  return (
    <div className="wrap page help-page">
      <h1>Customer care</h1>
      <section id="delivery">
        <h2>Shipping &amp; delivery</h2>
        <p>
          {config
            ? "Standard delivery costs " +
              taka(config.shipping.fee) +
              ". Orders of " +
              taka(config.shipping.freeOver) +
              " or more qualify for free delivery."
            : "Your delivery fee appears in checkout before you place your order."}{" "}
          Enter your Bangladesh mobile number, delivery address and postcode at
          checkout.
        </p>
      </section>
      <section id="faq">
        <h2>Frequently asked questions</h2>
        <details open>
          <summary>How do I pay?</summary>
          <p>
            Choose cash on delivery or online payment at checkout. Online orders
            open the SSLCOMMERZ payment page. Your receipt shows the confirmed
            payment status and order ID.
          </p>
        </details>
        <details>
          <summary>Where is my order?</summary>
          <p>
            Open{" "}
            <Link className="textbtn" href="/dashboard?tab=Orders">
              My orders
            </Link>{" "}
            to see your receipt and whether the store has confirmed or delivered
            your groceries.
          </p>
        </details>
        <details>
          <summary>When can I leave a review?</summary>
          <p>
            After delivery, open{" "}
            <Link
              className="textbtn"
              href="/dashboard?tab=Waiting%20for%20review"
            >
              Waiting for review
            </Link>{" "}
            in your dashboard.
          </p>
        </details>
      </section>
      <section id="contact">
        <h2>Contact &amp; order details</h2>
        <p>Keep your order ID handy for enquiries.</p>
        {email && (
          <a className="textbtn" href={"mailto:" + email}>
            {email}
          </a>
        )}{" "}
        {phone && (
          <a className="textbtn" href={"tel:" + phone}>
            {phone}
          </a>
        )}
        <p>
          <Link className="btn" href="/dashboard?tab=Orders">
            Find my order ID
          </Link>
        </p>
      </section>
    </div>
  );
}
