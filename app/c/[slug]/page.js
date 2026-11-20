import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCheck } from "react-icons/fi";
import { Cards } from "../../../components/Catalog";
import { Purchase } from "../../../components/Shopping";
import { detail, taka } from "../../../lib/shop";
import { getPublic } from "../../../lib/public-api";
export const dynamic = "force-dynamic";
async function campaign(params) {
  const { slug } = await params;
  const page = await getPublic("pages/" + encodeURIComponent(slug));
  if (!page) notFound();
  return page;
}
export async function generateMetadata({ params }) {
  const p = await campaign(params),
    image = p.products[0]?.image;
  return {
    title: p.title,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.description.slice(0, 200),
      ...(image ? { images: [image] } : {}),
    },
  };
}
export default async function Page({ params }) {
  const p = await campaign(params),
    [lead, ...others] = p.products;
  return (
    <div className="wrap page campaign">
      {lead ? (
        <>
          <div className="productlayout">
            <div className="detailphoto">
              <img src={lead.image} alt={lead.name} />
            </div>
            <section className="productinfo">
              <p className="product-meta">
                {lead.category} · {lead.origin}
              </p>
              <h1>{p.title}</h1>
              <p className="desc">{p.description}</p>
              {p.highlights?.length > 0 && (
                <ul className="highlights">
                  {p.highlights.map((line, i) => (
                    <li key={i}>
                      <FiCheck />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              <h2 className="lead-name">
                {lead.name} · {lead.unit}
              </h2>
              <p className="price large">
                {taka(lead.price)}{" "}
                {lead.compareAt > lead.price && (
                  <del>{taka(lead.compareAt)}</del>
                )}
              </p>
              <Purchase product={lead} />
              <Link className="textbtn" href={detail(lead._id)}>
                Product details and reviews
              </Link>
            </section>
          </div>
          {others.length > 0 && (
            <section className="detail-reviews">
              <h2>Also in this collection</h2>
              <Cards items={others} quick />
            </section>
          )}
        </>
      ) : (
        <section>
          <h1>{p.title}</h1>
          <p className="empty">The featured items are currently unavailable.</p>
          <Link className="btn" href="/all-products">
            Browse groceries
          </Link>
        </section>
      )}
    </div>
  );
}
