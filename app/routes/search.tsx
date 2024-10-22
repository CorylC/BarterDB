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

export async function loader({ request }: LoaderFunctionArgs) {
  const allItemNames = await db
    .select("itemName")
    .distinct("itemName")
    .from("item");

  const searchParams = new URL(request.url).searchParams;

  const offeringItemIDs = (
    await db
      .select("itemID")
      .from("item")
      .where({
        itemName: searchParams.get("offeringItemName"),
      })
  ).map((item) => item.itemId);

  const listings = await db
    .select(
      "listingID",
      "itemID",
      "hasAmount",
      "wants",
      "wantsAmount",
      "tradeValue"
    )
    .from("listing")
    .where({
      wants: searchParams.get("wantItemName"),
    })
    .whereIn("itemID", offeringItemIDs);

  return json({ allItemNames, listings });
}

export default function Search() {
  const { allItemNames, listings } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const offeringItemName = searchParams.get("offeringItemName");
  const wantItemName = searchParams.get("wantItemName");

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col p-4">
        <H1>Search</H1>
        <Form method="GET">
          <div className="">
            <div className="flex gap-2">
              <label htmlFor="offeringItemName">Show listings offering:</label>
              <select name="offeringItemName" id="offeringItemName">
                {allItemNames.map((item) => (
                  <option key={item.itemName} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <label htmlFor="wantItemName">Show listings which want:</label>
              <select name="wantItemName" id="wantItemName">
                {allItemNames.map((item) => (
                  <option key={item.itemName} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit">Search</Button>
        </Form>
        <div className="border border-black p-4 mt-4">
          {listings.length ? (
            <div className="flex flex-col gap-2">
              {listings.map((listing, idx) => (
                <div
                  key={listing.listingID}
                  className="m-2 p-2 border border-black"
                >
                  <p>
                    {listing.hasAmount} {offeringItemName} for{" "}
                    {listing.wantsAmount} {listing.wants}
                    <Link to={`/trade/${listing.listingId}`}>
                      <Button type="button">Trade</Button>
                    </Link>
                  </p>
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
