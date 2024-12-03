import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { i } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H3 from "~/src/components/H3";
import Link from "~/src/components/Link";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import randomString from "~/src/helpers/randomString";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const listingId = params.listingId;

  const listingInfo = await db
    .select(
      "listing.hasAmount",
      "listing.wantsAmount",
      "listing.wants",
      "listing.itemId",
      "listing.partnerId",
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
  if (partnerInfo?.userId) {
    partnerHasAmountSum = await db
      .sum("amount")
      .from("item")
      .where("userId", partnerInfo.userId)
      .andWhere("itemName", listingInfo.wants)
      .first();
  }

  const userHasAmount = userHasAmountSum["sum(`amount`)"] ?? 0;
  const partnerHasAmount = partnerHasAmountSum?.["sum(`amount`)"] ?? 0;

  const canMakeTrade =
    userHasAmount + partnerHasAmount >= listingInfo.wantsAmount;

  return {
    listingInfo,
    userHasAmount,
    partnerHasAmount,
    canMakeTrade,
  };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const { userId } = await getUserInfoFromCookie(request);
  const formData = await request.formData();

  const _action = formData.get("_action");

  if (_action === "TRADE") {
    const listingId = params.listingId;
    const useItemOf: "partner" | "user" = formData.get("useItemOf") as any;
    const partnerId = (
      await db("users").select("partnerId").where("userId", userId).first()
    ).partnerId;

    const listingInfo = await db
      .select([
        "l.listingId",
        "l.userId",
        "l.itemId",
        "l.hasAmount",
        "l.wantsAmount",
        "l.wants",
        "l.partnerId",
        "i.itemName",
      ])
      .from("listing AS l")
      .join("item as i", "i.itemId", "l.itemId")
      .where("listingId", listingId)
      .first();

    const wantsItem = await db("item")
      .select("itemId", "userId", "amount", "valuePerUnit")
      .where("itemName", listingInfo.wants)
      .andWhere("userId", useItemOf === "partner" ? partnerId : userId)
      .first();

    // split off the correct amount of the item
    if (wantsItem.amount > listingInfo.wantsAmount) {
      await db("item").insert({
        userId: wantsItem.userId,
        itemName: listingInfo.wants,
        amount: wantsItem.amount - listingInfo.wantsAmount,
        valuePerUnit: wantsItem.valuePerUnit,
        inMovement: false,
      });

      await db("item")
        .update({ amount: listingInfo.wantsAmount })
        .where("itemId", wantsItem.itemId);
    }

    const matchingListing = await db("listing")
      .insert({
        userId: useItemOf === "partner" ? partnerId : userId,
        partnerId: useItemOf === "partner" ? userId : partnerId,
        itemId: wantsItem.itemId,
        hasAmount: listingInfo.wantsAmount,
        wantsAmount: listingInfo.hasAmount,
        wants: listingInfo.itemName,
        tradeValue: 1.0, // Im gonna be honest I don't know what this is for
      })
      .returning("listingId");

    const hashKey = randomString(16);
    const transaction = await db("transactions")
      .insert({
        listing1: listingId,
        listing2: matchingListing[0].listingId,
        fullHash: hashKey,
        equivalence: 1.0, // Im gonna be honest I don't know what this is for
      })
      .returning("transactionId");

    if (!!transaction[0]?.transactionId) {
      return { success: true };
    }
  }

  return { success: false };
}

export default function Trade() {
  const { listingInfo, userHasAmount, partnerHasAmount, canMakeTrade } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const userHasEnough = userHasAmount > listingInfo.wantsAmount;
  const partnerHasEnough = partnerHasAmount > listingInfo.hasAmount;

  const chooseItem = userHasEnough && partnerHasEnough;
  const mustUseUsersItem = userHasEnough && !partnerHasEnough;
  const mustUsePartnersItem = partnerHasEnough && !userHasEnough;

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
            <Form method="POST">
              {chooseItem && (
                <div>
                  <input
                    type="radio"
                    name="useItemOf"
                    id="useItemOf"
                    value="user"
                  />
                  <input
                    type="radio"
                    name="useItemOf"
                    id="useItemOf"
                    value="partner"
                  />
                </div>
              )}
              {mustUseUsersItem && (
                <input
                  type="hidden"
                  name="useItemOf"
                  id="useItemOf"
                  value="user"
                />
              )}
              {mustUsePartnersItem && (
                <input
                  type="hidden"
                  name="useItemOf"
                  id="useItemOf"
                  value="partner"
                />
              )}
              <Button
                type="submit"
                name="_action"
                value="TRADE"
                disabled={actionData?.success}
              >
                {actionData?.success ? "Success" : "Make Trade"}
              </Button>
            </Form>
          ) : (
            <p>You cannot make a trade</p>
          )}
        </div>
        {actionData?.success && (
          <p>
            You have initialized a trade. Click{" "}
            <Link href="/myListings">here</Link> to view it in your listings.
          </p>
        )}
      </div>
    </div>
  );
}
