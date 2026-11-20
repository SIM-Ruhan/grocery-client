import { notFound } from "next/navigation";
import { getPublic } from "../../../lib/public-api";
import { Product } from "../../../components/Shopping";
export const dynamic = "force-dynamic";
async function getProduct(params) {
  const { id } = await params;
  const p = await getPublic("products/" + encodeURIComponent(id));
  if (!p) notFound();
  return p;
}
export async function generateMetadata({ params }) {
  const p = await getProduct(params);
  return {
    title: p.name,
    description: p.details.slice(0, 160),
    openGraph: { title: p.name, images: [p.image] },
  };
}
export default async function Page({ params }) {
  return <Product product={await getProduct(params)} />;
}
