import { Suspense } from "react";
import LessonsView from "./LessonsView";

// Suspense because the list reads its course filter from the URL.
export default function LessonsPage() {
  return (
    <Suspense fallback={null}>
      <LessonsView />
    </Suspense>
  );
}
