import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  var data;
  try {
    data = await db
      .select(
        "listing.listingId",
        "listing.itemId",
        "listing.hasAmount",
        "listing.wantsAmount",
        "listing.wants",
        "item.itemName",
        "item.itemId",
        "transactions.transactionId",
        "transactions.firstHalfHash",
        "transactions.secondHalfHash",
        "transactions.fullHash",
        "transactions.listing1",
        "transactions.listing2"
      )
      .from("listing")
      .innerJoin("item", "listing.itemId", "item.itemId")
      .leftOuterJoin("transactions", function () {
        this.on("transactions.listing1", "=", "listing.listingId").orOn(
          "transactions.listing2",
          "=",
          "listing.listingId"
        );
      })
      .where("listing.userId", userId);
  } catch (error) {
    // @ts-ignore
    console.log(error?.message);
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
            <ListingDisplay key={listing.listingId} {...listing} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingDisplay({
  listingId,
  itemName,
  hasAmount,
  wants,
  wantsAmount,
  transactionId,
  fullHash,
  firstHalfHash,
  secondHalfHash,
  listing1,
  listing2,
}) {
  const isPartOfTransaction = transactionId;

  const isTransactionPending =
    transactionId && (!firstHalfHash || !secondHalfHash);

  const actionRequired =
    (listingId === listing1 && !firstHalfHash) ||
    (listingId === listing2 && !secondHalfHash);

  const hashHalf =
    listingId === listing1 ? fullHash.slice(0, 8) : fullHash.slice(8, 16);

  return (
    <div key={listingId} className="p-2 border border-black rounded-sm">
      <p>Offer: {itemName}</p>
      <p>Quantity: {hasAmount}</p>
      <p>Looking For: {wants}</p>
      <p>Looking For Quantity: {wantsAmount}</p>
      {isPartOfTransaction && (
        <>
          <p>Your Transaction Key: {hashHalf}</p>
          {isTransactionPending ? (
            <>
              <p>Transaction Pending</p>
              {actionRequired && (
                <p>
                  ACTION REQUIRED:{" "}
                  <span>
                    Send your items along with your secure transaction key to
                    the BarterDB mediators.
                  </span>
                </p>
              )}
            </>
          ) : (
            <p>Transaction Complete</p>
          )}
        </>
      )}
    </div>
  );
}
