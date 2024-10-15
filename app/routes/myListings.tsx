import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  var data;
  var items;
  try {
    data = await db.select("*")
    .from("lising")
    .innerJoin("item", "listing.itemId", "item.itemId")
    .where("userId", userId);
  } catch (error) {
    data = [{
      Name: "Bad Query.",
    }];
  }

  return { listings: data, userId };
}

export default function myItems() {
  const { listings, userId } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>My listings:</H1>
            {listings.map((listing) => (
              <p key={listing.itemID}>
                Name: {listing.itemName}, Amount: {listing.hasAmount}, Value :{" "}
                {listing.valuePerUnit * listing.hasAmount}, Looking For: {listing.wants}, Looking For how many: {listing.wantsAmount}
              </p>
            ))}
      </div>
    </div>
  );
}
