import Link from "next/link";
export default function Missing() {
  return (
    <div className="wrap page">
      <h1>Page unavailable</h1>
      <p className="empty">
        This link may have changed or the item may have been removed.
      </p>
      <Link className="btn" href="/all-products">
        Browse groceries
      </Link>
    </div>
  );
}
