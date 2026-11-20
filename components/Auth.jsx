"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { api, safeReturn } from "../lib/shop";
import { useStore } from "./Store";
import { Feedback } from "./Catalog";
export function Gate({ children, admin = false }) {
  const { user, ready, sessionError, refresh } = useStore();
  const pathname = usePathname(),
    params = useSearchParams(),
    destination = pathname + (params.size ? "?" + params.toString() : "");
  if (sessionError) return <Feedback error={sessionError} retry={refresh} />;
  if (!ready) return <Feedback />;
  if (!user)
    return (
      <section className="wrap panel narrow">
        <h1>Sign in to continue</h1>
        <p>Your account keeps your orders and shopping cart together.</p>
        <Link
          className="btn"
          href={"/sign-in?next=" + encodeURIComponent(destination)}
        >
          Sign in
        </Link>
      </section>
    );
  if (admin && !user.admin)
    return (
      <section className="wrap panel">
        <h1>Administrator access required</h1>
        <p>You’re signed in as {user.email}.</p>
        <Link
          className="btn"
          href={"/sign-in?next=" + encodeURIComponent(destination)}
        >
          Sign in with an admin account
        </Link>
        <p>
          <Link className="textbtn" href="/dashboard">
            My dashboard
          </Link>
        </p>
      </section>
    );
  return children;
}
export function AuthForm({ signup, next }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { settings, sessionError } = useStore();
  const destination = safeReturn(next);
  async function submit(e, social = false) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (social) {
        const r = await api("auth/sign-in/social", "POST", {
          provider: "google",
          callbackURL: location.origin + destination,
        });
        if (!r.url) throw Error("Google sign-in is unavailable.");
        location.assign(r.url);
      } else {
        const fields = Object.fromEntries(new FormData(e.target));
        if (signup) fields.callbackURL = location.origin + destination;
        await api(
          signup ? "auth/sign-up/email" : "auth/sign-in/email",
          "POST",
          fields,
        );
        location.assign(destination);
      }
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <div className="wrap authpage">
      <div className="authphoto">
        <img src="/media/hero-fruit.webp" alt="Sunlit oranges on the tree" />
      </div>
      <div className="authform">
        <h1>{signup ? "Create an account" : "Welcome back"}</h1>
        <p>
          {signup
            ? settings?.emailVerification
              ? "Create your account and check your email for a verification link."
              : "Save your cart and follow your orders."
            : "Sign in to your Grove Market account."}
        </p>
        <form onSubmit={submit} className="form">
          {signup && (
            <label>
              Full name
              <input autoComplete="name" name="name" required maxLength="100" />
            </label>
          )}
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={signup ? 8 : 1}
              autoComplete={signup ? "new-password" : "current-password"}
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Sign up" : "Sign in"}
          </button>
        </form>
        {sessionError && (
          <p role="alert" className="error">
            {sessionError}
          </p>
        )}
        {settings?.google && (
          <button
            className="secondary wide"
            disabled={busy}
            onClick={(e) => submit(e, true)}
          >
            Continue with Google
          </button>
        )}
        <p>
          {signup ? "Already registered?" : "New to Grove Market?"}{" "}
          <Link
            className="textbtn"
            href={
              (signup ? "/sign-in" : "/sign-up") +
              "?next=" +
              encodeURIComponent(destination)
            }
          >
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
