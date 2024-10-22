import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import { getSession } from "~/sessions";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await getUserInfoFromCookie(request);
  const userData = await db
    .select("partnerId", "userId")
    .from("users")
    .where("userId", userId)
    .first();
  let partnerData: any = null;
  if (userData.partnerId) {
    partnerData = await db
      .select("userId", "partnerId", "username")
      .from("users")
      .where("userId", userData.partnerId)
      .first();
  }

  if (partnerData?.partnerId !== userId) {
    partnerData = null;
  }

  return { userData, partnerData };
};

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

  if (ret.errors.partnerId) {
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
  } else if (samePartner[0].partnerId == partnerId) {
    ret.errors.partnerId =
      "Please have your partner set their partnerId to your userId of " +
      userId;
    return ret;
  } else if (partnerId == userId) {
    ret.errors.partnerId = "You cannot be partners with yourself";
    return ret;
  } else {
    await db("users")
      .where("userId", userId)
      .update({ partnerId }, "partnerId");

    // @ts-ignore
    ret.success = true;
    return ret;
  }
};

export default function addPartner() {
  const { userData, partnerData } = useLoaderData<typeof loader>();
  const partnershipMade = userData?.partnerId === partnerData?.userId;
  const pendingPartnership = userData?.partnerId && !partnerData?.partnerId;
  const actionData = useActionData<typeof action>();
  const data = useActionData<typeof action>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col h-screen w-screen items-center justify-center">
        <H1 className="mb-10">Add a partner</H1>
        {JSON.stringify(userData)}
        {JSON.stringify(partnerData)}
        {partnershipMade && (
          <p>You are partners with user {partnerData?.username}</p>
        )}
        {pendingPartnership && (
          <p>
            You are pending partners with user {userData.partnerId}. They must
            log in to their account and add your ID to complete the partnership.
          </p>
        )}
        {!pendingPartnership && !partnershipMade && (
          <>
            <p>
              Both you and your partner must enter each others userId into this
              field before you are recognized as partners
            </p>
            <Form method="POST" className="flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-4 items-end">
                <LabeledTextInput
                  id="partnerId"
                  label="partnerId"
                  errorMessage={data?.errors?.partnerId}
                  placeholder="partnerId"
                />
              </div>
              <Button type="submit">
                {actionData?.success ? "Success" : "Add Partner"}
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
