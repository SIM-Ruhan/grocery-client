import Dashboard from "../../components/Dashboard";
export default async function Page({ searchParams }) {
  return <Dashboard initial={(await searchParams).tab} />;
}
