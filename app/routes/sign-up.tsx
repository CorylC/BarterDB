import { ActionFunction, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import db from "~/db.server";
import { commitSession, getSession } from "~/sessions";
import Button from "~/src/components/Button";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import TextInput from "~/src/components/TextInput";
import { passwordPattern } from "~/src/helpers/passwordHelpers";

export const action: ActionFunction = async ({ request }) => {
  const ret = {
    errors: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  };
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password");

  if (!username) {
    ret.errors.username = "Username is required";
  }

  if (!password) {
    ret.errors.password = "Password is required";
  } else if (!password.match(passwordPattern)) {
    ret.errors.password = "Password must be at least 8 characters";
  }

  if (password !== confirmPassword) {
    ret.errors.confirmPassword = "Passwords do not match";
  }
  if (
    ret.errors.username ||
    ret.errors.password ||
    ret.errors.confirmPassword
  ) {
    return ret;
  }

  // if the form structure is valid, check the db
  const sameUsername = await db
    .select("userId")
    .from("users")
    .where("username", username)
    .first();

  if (sameUsername) {
    ret.errors.username = "Username is already taken";
    return ret;
  } else {
    const data = await db
      .insert({ username, password }, "userId")
      .into("users");

    const userId = data[0].userId;
    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", userId);
    // @ts-ignore
    session.set("username", username);

    throw redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
};

export default function SignUp() {
  const data = useActionData<typeof action>();

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <h1 className="mb-10">Sign Up</h1>
      <Form method="POST" className="flex flex-col gap-4 items-end">
        <LabeledTextInput
          id="username"
          label="Username"
          errorMessage={data?.errors?.username}
          placeholder="JohnDoe"
        />
        <LabeledTextInput
          id="password"
          label="Password"
          errorMessage={data?.errors?.password}
          type="password"
        />
        <LabeledTextInput
          id="confirm-password"
          label="Confirm Password"
          errorMessage={data?.errors?.confirmPassword}
          type="password"
        />
        <Button type="submit">Sign Up</Button>
      </Form>
    </div>
  );
}
