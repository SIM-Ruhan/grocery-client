import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/playfair-display/index.css";
import "./globals.css";
import { Provider } from "../components/Store";
import { Header, Footer, CartNavigation } from "../components/Shell";
const siteOrigin =
  process.env.STOREFRONT_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
    : "http://localhost:3000");
export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Grove Market | Organic groceries",
    template: "%s | Grove Market",
  },
  description:
    "Shop vegetables, fruit, dairy and pantry groceries for delivery in Bangladesh.",
};
export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#content" className="skip">
          Skip to content
        </a>
        <Provider>
          <Header />
          <main id="content">{children}</main>
          <Footer />
          <CartNavigation />
        </Provider>
      </body>
    </html>
  );
}
