import { cache } from "react";
export const getPublic = cache(async (path) => {
  const origin = new URL(process.env.API_ORIGIN || "http://localhost:8000")
    .origin;
  const response = await fetch(origin + "/api/" + path, {
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw Error("The store could not load this page.");
  return response.json();
});
