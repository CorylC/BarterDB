import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import db from "~/db.server";
import { commitSession, getSession } from "~/sessions";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import Link from "~/src/components/Link";

export async function action({ request }: ActionFunctionArgs) {
  const ret = { errorMessage: "" };
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const userRow = await db
    .select("userId")
    .from("users")
    .where("username", username)
    .andWhere("password", password)
    .first();

  if (!userRow) {
    ret.errorMessage = "No account exists with that username and password";
    return ret;
  } else {
    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", userRow.userId);
    // @ts-expect-error: rah
    session.set("username", username);

    throw redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function Login() {
  const data = useActionData<typeof action>();
  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <H1 className="mb-10">Login</H1>
      <Form method="POST" className="flex flex-col gap-4 items-center">
        {data?.errorMessage && (
          <p className="text-red-500">{data.errorMessage}</p>
        )}
        <div className="flex flex-col gap-4 items-end">
          <LabeledTextInput
            id="username"
            label="Username"
            placeholder="JohnDoe"
          />
          <LabeledTextInput id="password" label="Password" type="password" />
        </div>
        <Button type="submit">Login</Button>
      </Form>
      <p>
        Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
      </p>
    </div>
  );
}
