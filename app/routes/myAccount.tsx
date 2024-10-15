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
    data = await db
      .select("*")
      .from("users")
      .where("userId", userId);
  } catch (error) {
    data = [
      {
        "username": "no account.",
        "partnerId": "no account.",
        "userId": "no account."
      },
    ];
  }

  return { data, userId };
}

export default function myItems() {
  const { data, userId } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <H1>User:</H1>
      <div>
        {data.map((User) => (
          <p key={User.userID}>
            Name: {User.username}, PartnerId: {User.partnerId}, UserId:{User.userId}
          </p>
        ))}
      </div>
    </div>
  );
}
  
