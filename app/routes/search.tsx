import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  json,
  Link,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId } = await getUserInfoFromCookie(request);

  const allItemNames = await db
    .select("itemName")
    .distinct("itemName")
    .from("item");

  const searchParams = new URL(request.url).searchParams;
  var listings;

  if (searchParams.toString()) {
    const offeringItemIDs = (
      await db
        .select("itemID")
        .from("item")
        .where({
          itemName: searchParams.get("offeringItemName"),
        })
    ).map((item) => item.itemId);

    const listingsPromise = db
      .select(
        "listing.listingId",
        "listing.itemId",
        "listing.hasAmount",
        "listing.wants",
        "listing.wantsAmount",
        "listing.tradeValue",
        "item.itemName"
      )
      .from("listing")
      .innerJoin("item", "listing.itemId", "item.itemId")
      .whereNotIn(
        "listingId",
        (await db("transactions").select("listing1 AS listingId")).map(
          ({ listingId }) => listingId
        )
      )
      .whereNotIn(
        "listingId",
        (await db("transactions").select("listing2 AS listingId")).map(
          ({ listingId }) => listingId
        )
      )
      .whereNot("listing.userId", userId);

    if (searchParams.get("wantItemName")) {
      listingsPromise.where({
        wants: searchParams.get("wantItemName"),
      });
    }
    if (searchParams.get("offeringItemName")) {
      listingsPromise.whereIn("listing.itemId", offeringItemIDs);
    }
    listings = await listingsPromise;
  } else {
    listings = await db
      .select(
        "listing.listingId",
        "listing.itemId",
        "listing.hasAmount",
        "listing.wants",
        "listing.wantsAmount",
        "listing.tradeValue",
        "item.itemName"
      )
      .from("listing")
      .innerJoin("item", "listing.itemId", "item.itemId")
      .whereNot("listing.userId", userId)
      .whereNotIn(
        "listingId",
        (
          await db("transactions").select("listing1 AS listingId")
        ).map(({ listingId }) => listingId)
      )
      .whereNotIn(
        "listingId",
        (
          await db("transactions").select("listing2 AS listingId")
        ).map(({ listingId }) => listingId)
      );
  }

  return json({ allItemNames, listings });
}

export default function Search() {
  const { allItemNames, listings } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  //const offeringItemName = searchParams.get("offeringItemName");
  //if (offeringItemName == null) {
  //}

  const wantItemName = searchParams.get("wantItemName");

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col p-4">
        <H1>Search</H1>
        <Form method="GET">
          <div>
            <div className="flex gap-2">
              <label htmlFor="offeringItemName">Show listings offering:</label>
              <select
                name="offeringItemName"
                id="offeringItemName"
                defaultValue=""
              >
                <option value="" disabled>
                  Select an item
                </option>
                {allItemNames.map((item) => (
                  <option key={item.itemName} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <label htmlFor="wantItemName">Show listings which want:</label>
              <select name="wantItemName" id="wantItemName" defaultValue="">
                <option value="" disabled>
                  Select an item
                </option>
                {allItemNames.map((item) => (
                  <option key={item.itemName} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit">Search</Button>
          <Button type="reset" style={{ marginLeft: "50px" }}>
            Clear Fields
          </Button>
        </Form>
        <div className="border border-black p-4 mt-4">
          {listings.length ? (
            <div className="flex flex-col gap-2">
              {listings.map((listing, idx) => (
                <div
                  key={listing.listingID}
                  className="m-2 p-2 border border-black flex justify-between items-center"
                >
                  <p>
                    {parseFloat(listing.hasAmount).toFixed(2)}{" "}
                    {listing.itemName} for{" "}
                    {parseFloat(listing.wantsAmount).toFixed(2)} {listing.wants}
                  </p>
                  <Link to={`/trade/${listing.listingId}`}>
                    <Button type="button" style={{ marginLeft: "10px" }}>
                      Trade
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
