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
    data = await db
      .select("*")
      .from("listing")
      .innerJoin("item", "listing.itemId", "item.itemId")
      .where("listing.userId", userId);
  } catch (error) {
    data = [];
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
        <div className="mt-4 flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.itemID}
              className="p-2 border border-black rounded-sm"
            >
              <p>Offer: {listing.itemName}</p>
              <p>Quantity: {listing.hasAmount}</p>
              <p>Looking For: {listing.wants}</p>
              <p>Looking For Quantity: {listing.wantsAmount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
