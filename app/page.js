import Home from "../components/Home";
import { getPublic } from "../lib/public-api";
export const dynamic = "force-dynamic";
export default async function Page() {
  const products = await getPublic("products").catch(() => null);
  return <Home initialProducts={products} />;
}
