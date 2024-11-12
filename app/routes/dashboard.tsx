import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import { ADMIN_USER_IDS } from "./admin.dashboard";
import Link from "~/src/components/Link";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserInfoFromCookie(request);

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>Welcome back, {user.username}</H1>
        {ADMIN_USER_IDS.includes(user.userId) && (
          <Link href="/admin/dashboard">Admin Dashboard</Link>
        )}
      </div>
    </div>
  );
}
