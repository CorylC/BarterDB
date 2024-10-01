import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "~/db.server";

export const meta: MetaFunction = () => {
  return [{ title: "Barter DB" }];
};

export async function loader() {
  const data = await db.select("*").from("users");
  return data;
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <h1>Current Users</h1>
      <div className="flex flex-col">
        {data.map((user) => (
          <p key={user.userId}>{user.username}</p>
        ))}
      </div>
    </div>
  );
}
