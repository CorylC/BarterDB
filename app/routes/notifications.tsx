import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";
import RequestButton from "~/src/components/RequestButton";

// Adjusted action function to correctly handle JSON data
export async function action({ request }: ActionFunctionArgs) {
  const { partnerUserId, actionType } = await request.json(); // Properly parse JSON from request
  const user = await getUserInfoFromCookie(request);

  if (actionType === "accept") {
    // Update current user's partnerId to the partnerUserId
    await db("users")
      .where("userId", user.userId)
      .update({ partnerId: partnerUserId });
  } else if (actionType === "deny") {
    // Set the requester’s partnerId to null
    await db("users")
      .where("userId", partnerUserId)
      .update({ partnerId: null });
  }

  return new Response("Request processed", { status: 200 });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserInfoFromCookie(request);

  let partnerData;
  const partner = await db
    .select("partnerId")
    .from("users")
    .where("userId", user["userId"]);
  try {
    partnerData = await db
      .select("userId", "username")
      .from("users")
      .where("partnerId", user["userId"])
      .whereNot("userId", partner[0]["partnerId"]);
  } catch (error) {
    partnerData = [
      {
        userId: "",
        username: "",
      },
    ];
  }

  return { partnerData, user };
}

export default function Dashboard() {
  const { partnerData, user } = useLoaderData<typeof loader>();

  // Handlers to send fetch requests to the action
  async function handleAccept(partnerUserId: string) {
    await fetch("/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerUserId, actionType: "accept" }),
    });

    // Force page refresh upon successful action, doesn't display otherwise
    window.location.reload();
  }

  async function handleDeny(partnerUserId: string) {
    await fetch("/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerUserId, actionType: "deny" }),
    });
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <div className="flex flex-col items-center">
          <H1>NOTIFICATIONS:</H1>
          <div>
            {partnerData.map((request) => (
              <div key={request.itemID}>
                <p>
                  PARTNER REQUEST: From {request.username}, ID: {request.userId}
                </p>
                <RequestButton
                  text="Accept"
                  onClick={() => handleAccept(request.userId)}
                  styleType="accept"
                />
                <RequestButton
                  text="Deny"
                  onClick={() => handleDeny(request.userId)}
                  styleType="deny"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
