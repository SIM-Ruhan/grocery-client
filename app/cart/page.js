import { Bag } from "../../components/Shopping";
export const metadata = { title: "Shopping cart" };
export default function Page() {
  return (
    <div className="wrap page">
      <Bag />
    </div>
  );
}
