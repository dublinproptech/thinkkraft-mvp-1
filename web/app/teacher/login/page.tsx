import { Suspense } from "react";
import StaffLogin from "../../admin/components/StaffLogin";

// Teachers have their own door too: the children's login asks for a username
// and a PIN, which is not what a teacher has.
export default function TeacherLoginPage() {
  return (
    <Suspense fallback={<main className="admin-signin"><p>Loading...</p></main>}>
      <StaffLogin
        role="TEACHER"
        title="Teacher sign in"
        description="Review and approve hints before they reach a child."
        home="/teacher"
      />
    </Suspense>
  );
}
