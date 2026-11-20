import { Checkout } from "../../components/Checkout";
export default async function Page({ params, searchParams }) {
  return <Checkout params={await searchParams} />;
}
