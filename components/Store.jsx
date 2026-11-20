"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, newRequestId } from "../lib/shop";
const Store = createContext(null);
export const useStore = () => useContext(Store);
const guestKey = "grove-guest-cart-v1";
function guest() {
  const saved = localStorage.getItem(guestKey);
  if (saved)
    try {
      const data = JSON.parse(saved);
      if (typeof data?.key === "string" && Array.isArray(data.items))
        return data;
    } catch {}
  return { key: newRequestId(), items: [] };
}
export function Provider({ children }) {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [bag, setBag] = useState([]);
  const [settings, setSettings] = useState(null),
    [sessionError, setSessionError] = useState(""),
    [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false),
    lock = useRef(false);
  const refresh = useCallback(async () => {
    setSessionError("");
    const config = await api("settings");
    setSettings(config);
    let account = null;
    try {
      account = await api("me");
    } catch (e) {
      if (e.status !== 401) throw e;
    }
    setUser(account);
    const local = guest();
    if (!account) {
      setBag(local.items);
      return;
    }
    if (local.items.length) {
      const result = await api("cart/import", "POST", {
        key: local.key,
        items: local.items.map(({ productId, size, qty }) => ({
          productId,
          size,
          qty,
        })),
      });
      setBag(result.items);
      localStorage.removeItem(guestKey);
      if (result.adjusted)
        setNotice("Your cart was updated to match available stock.");
    } else setBag(await api("cart"));
  }, []);
  const init = useCallback(async () => {
    try {
      await refresh();
    } catch (e) {
      setSessionError(e.message);
    } finally {
      setReady(true);
    }
  }, [refresh]);
  useEffect(() => {
    init();
    const sync = (e) => {
      if (e.key === guestKey) init();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [init]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  async function change(product, size, qty, mode = "add") {
    if (lock.current) throw Error("Your cart is being updated.");
    lock.current = true;
    setBusy(true);
    try {
      if (!ready || sessionError)
        throw Error("Please reconnect to the store first.");
      const line = { productId: product._id, size, qty, mode };
      if (user) setBag(await api("cart", "POST", line));
      else {
        const local = guest();
        const prev = local.items.find(
          (x) => x.productId === product._id && x.size === size,
        );
        const rest = local.items.filter((x) => x !== prev);
        const count = qty + (mode === "add" ? prev?.qty || 0 : 0);
        const total =
          rest
            .filter((x) => x.productId === product._id)
            .reduce((n, x) => n + x.qty, 0) + count;
        if (count > 50 || total > product.stock || (rest.length >= 50 && count))
          throw Error("That quantity is unavailable.");
        if (count)
          rest.push({ productId: product._id, size, qty: count, product });
        localStorage.setItem(
          guestKey,
          JSON.stringify({ key: newRequestId(), items: rest }),
        );
        setBag(rest);
      }
      if (mode === "add") setNotice("Added to your cart");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("auth/sign-out", "POST", {});
      location.assign("/");
    } catch (e) {
      setNotice(e.message);
    }
  }
  return (
    <Store.Provider
      value={{
        user,
        ready,
        bag,
        settings,
        sessionError,
        refresh: init,
        busy,
        change,
        logout,
        setNotice,
      }}
    >
      {children}
      <div role="status" aria-live="polite" className={notice ? "toast" : ""}>
        {notice}
      </div>
    </Store.Provider>
  );
}
export function useData(path) {
  const [state, setState] = useState({ data: null, error: "", path: "" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    if (!path) return;
    api(path)
      .then((data) => {
        if (live) setState({ data, error: "", path });
      })
      .catch((e) => {
        if (live) setState({ data: null, error: e.message, path });
      });
    return () => {
      live = false;
    };
  }, [path, tick]);
  return {
    ...(state.path === path ? state : { data: null, error: "" }),
    reload: () => setTick((n) => n + 1),
  };
}
