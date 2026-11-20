import { AuthForm } from "../../components/Auth";
export default async function Page({ params, searchParams }) {
  return <AuthForm signup next={(await searchParams).next} />;
}
