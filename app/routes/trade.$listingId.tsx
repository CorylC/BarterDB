import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H3 from "~/src/components/H3";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const listingId = params.listingId;

  const listingInfo = await db
    .select(
      "listing.hasAmount",
      "listing.wantsAmount",
      "listing.wants",
      "listing.itemId",
      "item.itemName"
    )
    .from("listing")
    .where("listingId", listingId)
    .join("item", "item.itemId", "listing.itemId")
    .first();

  const { userId } = await getUserInfoFromCookie(request);
  const partnerInfo = await db
    .select("p.userId")
    .from("users AS u")
    .join("users AS p", "u.partnerId", "p.userId")
    .where("u.userId", userId)
    .andWhere("p.partnerId", userId)
    .first();

  // @ts-ignore
  const userHasAmountSum: { "sum(`amount`)"?: number } = await db
    .sum("amount")
    .from("item")
    .where("userId", userId)
    .andWhere("itemName", listingInfo.wants)
    .first();

  let partnerHasAmountSum: any = null;
  if (partnerInfo.userId) {
    partnerHasAmountSum = await db
      .sum("amount")
      .from("item")
      .where("userId", partnerInfo.userId)
      .andWhere("itemName", listingInfo.wants)
      .first();
  }

  const userHasAmount = userHasAmountSum["sum(`amount`)"] ?? 0;
  const partnerHasAmount = partnerHasAmountSum["sum(`amount`)"] ?? 0;

  const canMakeTrade =
    userHasAmount + partnerHasAmount >= listingInfo.wantsAmount;

  return {
    listingInfo,
    userHasAmount,
    partnerHasAmount,
    canMakeTrade,
  };
}

export default function Trade() {
  const { listingInfo, userHasAmount, partnerHasAmount, canMakeTrade } =
    useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-10">
        <H3>Trade Info</H3>
        <div className="border border-black m-3 p-3">
          <p>
            Offering: {listingInfo.itemName} ({listingInfo.hasAmount})
          </p>
          <p>
            Wants: {listingInfo.wants} ({listingInfo.wantsAmount})
          </p>
        </div>
        <p>
          You have: {userHasAmount} {listingInfo.wants}
        </p>
        <p>
          Your partner has: {partnerHasAmount} {listingInfo.wants}
        </p>
        <div>
          {canMakeTrade ? (
            <Button type="button">Trade</Button>
          ) : (
            <p>You cannot make a trade</p>
          )}
        </div>
      </div>
    </div>
  );
}
