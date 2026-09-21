import { redirect } from "next/navigation";

// Adding and enrolling a child now happens on the parent dashboard, so this
// route just forwards there rather than being a second way to do the same job.
export default function EnrolPage() {
  redirect("/parent");
}
