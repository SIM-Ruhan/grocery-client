import { Browse } from "../../components/Shopping";
export default async function Page({ params, searchParams }) {
  return <Browse params={await searchParams} />;
}
