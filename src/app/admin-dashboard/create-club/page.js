// This route has been consolidated into /admin-dashboard/clubs
// Redirect to the new page to preserve any old bookmarks or links.
import { redirect } from "next/navigation";

export default function CreateClubRedirect() {
    redirect("/admin-dashboard/clubs");
}
