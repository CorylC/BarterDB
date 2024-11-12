import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import Button from "~/src/components/Button";
import { destroySession } from "~/sessions";
import { getSession } from "~/sessions";

export async function loader({ request }: LoaderFunctionArgs) {
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

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
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
        <div>
          <br></br>
          <Form method="POST">
            <Button type="submit">Logout</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
