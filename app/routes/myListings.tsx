import { useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  let data;
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
      .where("listing.userId", userId)
      .orWhere("listing.partnerId", userId);
  } catch (error) {
    data = [];
    if (error instanceof Error) {
      data = [];
      console.error(error.message);
    } else {
      console.error("Unknown error occurred");
    }
  }

  return { listings: data };
}

export async function action({ request }) {
  const { listingId } = await request.json();
  const { userId } = await getUserInfoFromCookie(request);

  try {
    const listing = await db
      .select(
        "listing.listingId",
        "listing.itemId",
        "listing.hasAmount",
        "listing.wants",
        "listing.wantsAmount",
        "listing.tradeValue",
        "item.itemName",
        "item.userId"
      )
      .from("listing")
      .innerJoin("item", "listing.itemId", "item.itemId")
      .where("listing.listingId", listingId);

    if (!listing) throw new Error("Listing not found");

    const { itemId, hasAmount } = listing[0];

    // Check if the item exists in the pool
    const existingItem = await db
      .select("amount")
      .from("item")
      .where("itemName", listing[0].itemName)
      .andWhere("userId", userId)
      .andWhere("inMovement", false);

    if (existingItem) {
      // Update existing item quantity
      await db
        .table("item")
        .where("itemName", listing[0].itemName)
        .andWhere("userId", userId)
        .andWhere("inMovement", false)
        .update(
          "amount",
          Number(existingItem[0].amount) + Number(listing[0].hasAmount)
        );
    } else {
      // Change inMovement to false so it can return to the pool
      await db
        .table("item")
        .where("itemId", listing[0].itemId)
        .update("inmovement", false);
    }

    // Delete the listing
    const toBeDeleted = await db
      .select("*")
      .from("listing")
      .where("listingId", listingId);
    await db.table("listing").where({ listingId }).del();

    return { success: true };
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unknown error");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default function myItems() {
  const { listings } = useLoaderData<typeof loader>();

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

async function DeleteListing(listingId: string) {
  await fetch("/myListings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  // Force page refresh upon successful action, doesn't display otherwise
  window.location.reload();
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
    listingId === listing1 ? fullHash?.slice(0, 8) : fullHash?.slice(8, 16);

  return (
    <div key={listingId} className="p-2 border border-black rounded-sm">
      <p>Offer: {itemName}</p>
      <p>Quantity: {hasAmount.toFixed(2)}</p>
      <p>Looking For: {wants}</p>
      <p>Looking For Quantity: {wantsAmount.toFixed(2)*.98}</p>
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
      {!isPartOfTransaction && (
        <button
          className="mt-2 bg-red-500 text-white p-1 rounded"
          onClick={() => DeleteListing(listingId)}
        >
          Remove Listing
        </button>
      )}
    </div>
  );
}
