import { ActionFunction, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import db from "~/db.server";
import { commitSession, getSession } from "~/sessions";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import Link from "~/src/components/Link";
import { passwordPattern } from "~/src/helpers/passwordHelpers";

export const action: ActionFunction = async ({ request }) => {
  const ret = {
    errors: {
      partnerId: "",
    },
  };

  
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  const formData = await request.formData();
  const partnerId = formData.get("partnerId");

  if (!partnerId) {
    ret.errors.partnerId = "partnerId is required";
  }

  if (
    ret.errors.partnerId
  ) {
    return ret;
  }

  // if the form structure is valid, check the db
  const samePartner = await db
    .select("partnerId")
    .from("users")
    .where("userId", userId);

  const partner = await db
    .select("partnerId")
    .from("users")
    .where("userId", partnerId);

  if (samePartner[0].partnerId == partnerId && partner[0].partnerId == userId) {
    ret.errors.partnerId = "You are already partners";
    return ret;
  } else if(samePartner[0].partnerId == partnerId) {
    ret.errors.partnerId = "Please have your partner set their partnerId to your userId of " + userId;
    return ret;
  } else if(partnerId == userId){
    ret.errors.partnerId = "You cannot be partners with yourself";
    return ret;
  } else {
      await db("users")
      .where("userId", userId)
      .update({ partnerId }, "partnerId");

    return ret;
  }
};

export default function addPartner() {
  const data = useActionData<typeof action>();

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <H1 className="mb-10">Add a partner</H1>
      <p>Both you and your partner must enter each others userId into this field before you are recognized as partners</p>
      <Form method="POST" className="flex flex-col gap-4 items-center">
        <div className="flex flex-col gap-4 items-end">
          <LabeledTextInput
            id="partnerId"
            label="partnerId"
            errorMessage={data?.errors?.partnerId}
            placeholder="partnerId"
          />
        </div>
        <Button type="submit">Set Partner</Button>
      </Form>
    </div>
  );
}
