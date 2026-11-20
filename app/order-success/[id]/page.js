import { Success } from "../../../components/Checkout";
export default async function Page({ params, searchParams }) {
  return <Success id={(await params).id} />;
}
