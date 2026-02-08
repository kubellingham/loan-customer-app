import { Suspense } from "react";
import AmountClient from "./AmountClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AmountClient />
    </Suspense>
  );
}
