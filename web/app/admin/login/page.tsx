import { Suspense } from "react";
import StaffLogin from "../components/StaffLogin";

// Suspense because StaffLogin reads the callbackUrl the middleware appended.
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="admin-signin"><p>Loading...</p></main>}>
      <StaffLogin
        role="ADMIN"
        title="Admin sign in"
        description="Manage courses, lessons and teachers."
        home="/admin"
      />
    </Suspense>
  );
}
