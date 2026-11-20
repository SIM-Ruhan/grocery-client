import { AuthForm } from "../../components/Auth";
export default async function Page({ params, searchParams }) {
  return <AuthForm next={(await searchParams).next} />;
}
