"use client";
import Link from "next/link";
export default function PageError({ reset }) {
  return (
    <div className="wrap page">
      <h1>Unable to load this page</h1>
      <p className="empty">The store connection was interrupted.</p>
      <div className="buttonrow">
        <button className="btn" onClick={reset}>
          Try again
        </button>
        <Link className="secondary" href="/">
          Back to home
        </Link>
      </div>
    </div>
  );
}
