import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  var data;
  try {
    data = await db.select("*").from("users").where("userId", userId).first();
  } catch (error) {
    data = {
      username: "no account.",
      partnerId: "no account.",
      userId: "no account.",
    };
  }

  return { user: data, userId };
}

export default function myItems() {
  const { user, userId } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>User:</H1>
        <div>
          <p>Name: {user.username}</p>
          <p>PartnerId: {user.partnerId ?? "None"}</p>
          <p>UserId: {user.userId}</p>
        </div>
      </div>
    </div>
  );
}
