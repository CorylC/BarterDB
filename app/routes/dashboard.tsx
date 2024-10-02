import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserInfoFromCookie(request);

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <H1>Welcome back, {user.username}</H1>
    </div>
  );
}
