"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "./Store";
import { Workspace, OrderCard } from "./Dashboard";
import { Gate } from "./Auth";
import { Feedback } from "./Catalog";
import { api, taka, departments } from "../lib/shop";
const tabs = [
  "Overview",
  "All products",
  "Add product",
  "All users",
  "Orders",
  "Landing pages",
];
const blank = {
  name: "",
  category: "Vegetables",
  origin: "Local",
  unit: "",
  organic: false,
  collections: [],
  price: "",
  compareAt: "",
  stock: "",
  sizes: [],
  details: "",
  image: "",
  trending: false,
  newArrival: false,
};
function fileData(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(Error("Could not read image."));
    r.readAsDataURL(file);
  });
}
function ProductEditor({ product = blank, onDone, cancel }) {
  const [image, setImage] = useState(product.image),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const f = new FormData(e.target),
        body = Object.fromEntries(f);
      let url = image;
      const file = f.get("file");
      if (file?.size) {
        if (file.size > 2 * 1024 * 1024)
          throw Error("Choose an image of 2 MB or less.");
        url = (
          await api("admin/images", "POST", { data: await fileData(file) })
        ).url;
        setImage(url);
      }
      if (!url) throw Error("Choose a product image.");
      const doc = {
        name: body.name,
        category: body.category,
        origin: body.origin,
        unit: body.unit,
        organic: f.has("organic"),
        collections: [
          ...new Set(
            body.collections
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ],
        price: Number(body.price),
        compareAt: Number(body.compareAt),
        stock: Number(body.stock),
        sizes: [
          ...new Set(
            body.sizes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          ),
        ],
        details: body.details,
        image: url,
        trending: f.has("trending"),
        newArrival: f.has("newArrival"),
        revision: product.revision,
      };
      await api(
        "admin/products" + (product._id ? "/" + product._id : ""),
        product._id ? "PUT" : "POST",
        doc,
      );
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form panel" onSubmit={save}>
      <label>
        Product name
        <input
          name="name"
          defaultValue={product.name}
          required
          maxLength="160"
        />
      </label>
      <div className="formpair">
        <label>
          Category
          <input
            name="category"
            required
            list="category-list"
            maxLength="60"
            defaultValue={product.category}
          />
          <datalist id="category-list">
            {departments.map((n) => (
              <option value={n} key={n} />
            ))}
          </datalist>
        </label>
        <label>
          Origin
          <select name="origin" defaultValue={product.origin}>
            <option>Local</option>
            <option>Exported</option>
          </select>
        </label>
      </div>
      <label>
        Pack unit
        <input
          name="unit"
          placeholder="e.g. 500 g, 1 kg or 6 pcs"
          defaultValue={product.unit}
          required
          maxLength="40"
        />
      </label>
      <label>
        Collections (optional, comma-separated)
        <input
          name="collections"
          defaultValue={(product.collections || []).join(", ")}
          placeholder="e.g. Breakfast essentials"
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="organic"
          defaultChecked={product.organic}
        />
        Organic product
      </label>
      <label>
        Product image · JPEG, PNG or WebP (up to 2 MB)
        <input
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!image}
        />
      </label>
      {image && <img className="thumb" alt="Current product" src={image} />}
      <label>
        Details
        <textarea
          name="details"
          defaultValue={product.details}
          required
          rows="4"
          maxLength="5000"
        />
      </label>
      <div className="formpair">
        {[
          ["price", "Selling price (BDT)"],
          ["compareAt", "Original price (optional)"],
          ["stock", "Available stock"],
        ].map(([n, l]) => (
          <label key={n}>
            {l}
            <input
              type="number"
              name={n}
              defaultValue={product[n] || (n === "stock" ? 0 : "")}
              min={n === "price" ? 0.01 : 0}
              step={n === "stock" ? 1 : 0.01}
              required={n !== "compareAt"}
            />
          </label>
        ))}
      </div>
      <label>
        Size or pack options (optional, same price)
        <input
          name="sizes"
          defaultValue={product.sizes.join(", ")}
          placeholder="e.g. Fine grind, Coarse grind"
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="trending"
          defaultChecked={product.trending}
        />
        Trending · show in Popular picks
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="newArrival"
          defaultChecked={product.newArrival}
        />
        New arrivals
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="buttonrow">
        <button className="btn" disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </button>
        {cancel && (
          <button type="button" className="secondary" onClick={cancel}>
            Back to products
          </button>
        )}
      </div>
    </form>
  );
}
function Products({ feed }) {
  const [edit, setEdit] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(""),
    [collectionProduct, setCollectionProduct] = useState("");
  async function addCollection(e, product) {
    e.preventDefault();
    setBusy(product._id);
    setError("");
    try {
      await api("admin/products/" + product._id + "/collections", "POST", {
        name: new FormData(e.currentTarget).get("name"),
      });
      setCollectionProduct("");
      feed.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function change(p, field) {
    if (field === "delete" && !confirm("Remove " + p.name + " from the store?"))
      return;
    setBusy(p._id);
    setError("");
    try {
      await api(
        "admin/products/" + p._id,
        field === "delete" ? "DELETE" : "PATCH",
        field === "delete" ? null : { field, value: !p[field] },
      );
      feed.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  if (edit)
    return (
      <>
        <h2>Edit {edit.name}</h2>
        <ProductEditor
          product={edit}
          cancel={() => setEdit(null)}
          onDone={() => {
            setEdit(null);
            feed.reload();
          }}
        />
      </>
    );
  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {feed.data.length === 0 && (
        <p className="empty">Your catalogue is empty.</p>
      )}
      {feed.data.map((p) => (
        <article className="adminproduct" key={p._id}>
          <img src={p.image} alt="" />
          <div>
            <h3>{p.name}</h3>
            <small>
              {p.category} · {p.stock} in stock · {taka(p.price)}
            </small>
            <div className="miniactions">
              <button onClick={() => setEdit(p)}>Edit</button>
              <button
                onClick={() =>
                  setCollectionProduct(collectionProduct === p._id ? "" : p._id)
                }
              >
                Add to collection
              </button>
              {[
                ["trending", "trending"],
                ["newArrival", "new arrivals"],
              ].map(([f, t]) => (
                <button
                  key={f}
                  disabled={Boolean(busy)}
                  onClick={() => change(p, f)}
                >
                  {p[f] ? "Remove from " : "Add to "}
                  {t}
                </button>
              ))}
              <button
                className="danger"
                disabled={Boolean(busy)}
                onClick={() => change(p, "delete")}
              >
                Delete
              </button>
            </div>
            {p.collections?.length > 0 && (
              <small>Collections · {p.collections.join(", ")}</small>
            )}
            {collectionProduct === p._id && (
              <form
                className="collection-form"
                onSubmit={(e) => addCollection(e, p)}
              >
                <label>
                  Collection name
                  <input name="name" required maxLength="60" />
                </label>
                <button className="secondary" disabled={Boolean(busy)}>
                  Save collection
                </button>
              </form>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
function Orders({ feed }) {
  const [filter, set] = useState("All"),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  async function act(o, status) {
    setBusy(o._id);
    setError("");
    try {
      await api(
        "admin/orders/" + o._id + (status ? "" : "/reconcile"),
        status ? "PATCH" : "POST",
        status ? { status } : {},
      );
      feed.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  const list = feed.data.filter((o) => filter === "All" || o.status === filter);
  return (
    <>
      <label className="filterlabel">
        Order status
        <select value={filter} onChange={(e) => set(e.target.value)}>
          {[
            "All",
            "Pending",
            "Confirmed",
            "Delivered",
            "Awaiting payment",
            "Payment review",
            "Cancelled",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!list.length && <p className="empty">No orders with this status.</p>}
      {list.map((o) => (
        <OrderCard order={o} key={o._id}>
          <p>
            {o.shipping.name} · {o.email} · {o.shipping.phone}
            <br />
            {o.shipping.address}, {o.shipping.city} {o.shipping.postcode}
            <br />
            {o.shipping.notes}
          </p>
          <small>Admin email · {o.emailStatus}</small>
          <div className="buttonrow">
            {["Pending", "Payment review", "Confirmed"].includes(o.status) && (
              <button
                className="btn"
                disabled={!!busy}
                onClick={() =>
                  act(o, o.status === "Confirmed" ? "Delivered" : "Confirmed")
                }
              >
                {o.status === "Confirmed"
                  ? "Mark delivered"
                  : o.status === "Payment review"
                    ? "Approve flagged payment and confirm"
                    : "Confirm order"}
              </button>
            )}
            {(o.payment === "Awaiting payment" ||
              ["retry", "queued"].includes(o.emailStatus)) && (
              <button
                className="secondary"
                disabled={!!busy}
                onClick={() => act(o, null)}
              >
                {o.payment === "Awaiting payment"
                  ? "Check payment"
                  : "Retry email"}
              </button>
            )}
          </div>
        </OrderCard>
      ))}
    </>
  );
}
function Campaigns({ feed }) {
  const catalog = useData("products"),
    [edit, setEdit] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const f = new FormData(e.target);
      await api("admin/pages", "POST", {
        edit: Boolean(edit._id),
        title: f.get("title"),
        slug: f.get("slug"),
        description: f.get("description"),
        productIds: [
          f.get("leadProduct"),
          ...f.getAll("products").filter((id) => id !== f.get("leadProduct")),
        ],
        highlights: String(f.get("highlights") || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        published: f.has("published"),
      });
      feed.reload();
      setEdit(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (edit)
    return (
      <form key={edit._id || "new"} className="form panel" onSubmit={save}>
        <label>
          Campaign title
          <input required name="title" defaultValue={edit.title} />
        </label>
        <label>
          Page URL slug
          <input
            required
            name="slug"
            minLength="2"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            readOnly={Boolean(edit._id)}
            defaultValue={edit._id}
            placeholder="wildflower-honey"
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            defaultValue={edit.description}
            required
          />
        </label>
        <label>
          Highlights (optional, one per line, up to 6)
          <textarea
            name="highlights"
            defaultValue={(edit.highlights || []).join("\n")}
            rows="3"
          />
        </label>
        <label>
          Main advertised product
          <select
            name="leadProduct"
            defaultValue={edit.productIds?.[0] || ""}
            required
          >
            <option value="">Choose a product</option>
            {catalog.data?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Additional products (optional)</legend>
          {catalog.data ? (
            catalog.data.map((p) => (
              <label className="check" key={p._id}>
                <input
                  type="checkbox"
                  name="products"
                  value={p._id}
                  defaultChecked={edit.productIds?.slice(1).includes(p._id)}
                />
                {p.name}
              </label>
            ))
          ) : (
            <Feedback error={catalog.error} retry={catalog.reload} />
          )}
        </fieldset>
        <label className="check">
          <input
            type="checkbox"
            name="published"
            defaultChecked={edit.published}
          />
          Publish this page
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="buttonrow">
          <button className="btn" disabled={busy}>
            Save landing page
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setEdit(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  return (
    <>
      <button
        className="btn"
        onClick={() => {
          setEdit({});
          setError("");
        }}
      >
        Create landing page
      </button>
      {!feed.data.length && (
        <p className="empty">Your campaigns will appear here.</p>
      )}
      {feed.data.map((p) => (
        <div className="panel" key={p._id}>
          <h3>{p.title}</h3>
          <p>
            {p.published ? "Published" : "Draft"} · /c/{p._id}
          </p>
          <div className="miniactions">
            <button
              onClick={() => {
                setEdit(p);
                setError("");
              }}
            >
              Edit
            </button>
            {p.published && <Link href={"/c/" + p._id}>Open landing page</Link>}
          </div>
        </div>
      ))}
    </>
  );
}
function Inside({ initial }) {
  const tab = tabs.includes(initial) ? initial : "Overview",
    router = useRouter();
  const paths = {
    Overview: "admin/overview",
    "All products": "products",
    "All users": "admin/users",
    Orders: "admin/orders",
    "Landing pages": "admin/pages",
  };
  const feed = useData(paths[tab]);
  let content;
  if (tab === "Add product")
    content = (
      <ProductEditor onDone={() => router.push("/admin?tab=All%20products")} />
    );
  else if (!feed.data)
    content = <Feedback error={feed.error} retry={feed.reload} />;
  else if (tab === "Overview")
    content = (
      <div className="metrics">
        {[
          ["catalog", "Active products", "All products"],
          ["customers", "Customers", "All users"],
          ["pending", "Awaiting confirmation", "Orders"],
          ["delivered", "Delivered orders", "Orders"],
        ].map(([k, t, route]) => (
          <Link href={"/admin?tab=" + encodeURIComponent(route)} key={k}>
            <small>{t}</small>
            <b>{feed.data[k]}</b>
          </Link>
        ))}
      </div>
    );
  else if (tab === "All products") content = <Products feed={feed} />;
  else if (tab === "All users")
    content = (
      <div className="tablebox">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {feed.data.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.admin ? "Admin" : "Customer"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  else if (tab === "Orders") content = <Orders feed={feed} />;
  else content = <Campaigns feed={feed} />;
  return (
    <Workspace admin tabs={tabs} tab={tab}>
      <h1>{tab}</h1>
      {content}
    </Workspace>
  );
}
export default function Admin({ initial }) {
  return (
    <Gate admin>
      <Inside initial={initial} />
    </Gate>
  );
}
