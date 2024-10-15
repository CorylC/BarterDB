import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";
import Link from "~/src/components/Link";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const username = session.get("username");

  return { userId, username };
}

export default function Index() {
  const { userId, username } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      {username ? (
        <div className="mb-8">
          <p>You are logged in as:</p>
          <p>Username: {username}</p>
          <p>userId: {userId}</p>
        </div>
      ) : (
        <div className="mb-8 flex flex-col">
          <p>You are not currently logged in.</p>
          <Link href="/login">Login</Link>
          <Link href="/sign-up">Sign Up</Link>
        </div>
      )}
    </div>
  );
}
