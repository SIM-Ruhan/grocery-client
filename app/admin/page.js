import Admin from "../../components/Admin";
export default async function Page({ searchParams }) {
  return <Admin initial={(await searchParams).tab} />;
}
