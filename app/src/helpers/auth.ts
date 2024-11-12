import { redirect } from "@remix-run/node";
import { getSession } from "~/sessions";

export async function verifyLoggedIn(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("userId") || !session.has("username")) {
    throw redirect("/login");
  }
}

export async function getUserInfoFromCookie(request: Request) {
  await verifyLoggedIn(request);

  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId") as unknown as number;
  const username = session.get("username");

  return { userId, username };
}
