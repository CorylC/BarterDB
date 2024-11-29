import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId } = await getUserInfoFromCookie(request);
  const ownedItems = await db
    .select("item.itemName", "item.itemID")
    .distinct("item.itemName")
    .from("item")
    .leftOuterJoin("listing", function () {
      this.on("item.itemID", "=", "listing.itemId");
    })
    .where({ "item.userId": userId })
    .andWhere({ "listing.listingId": null });

  const partnerItems = await db
    .select("item.itemName", "item.itemID")
    .from("item")
    .leftOuterJoin("listing", function () {
      this.on("item.itemID", "=", "listing.itemId");
    })
    .join("users", "item.userId", "users.userId")
    .where("users.partnerId", userId)
    .andWhere({ "listing.listingId": null });

  const availableItems = await db.select("itemName").distinct().from("item");

  return json({ ownedItems, availableItems, partnerItems });
}

export async function action({
  request,
}: ActionFunctionArgs): Promise<
  TypedResponse<{ success: boolean; message?: string }>
> {
  const formData = await request.formData();
  const { userId } = await getUserInfoFromCookie(request);

  const userInfo = await db("users")
    .select("partnerId")
    .where("userId", userId)
    .first();

  const partnerInfo = await db("users")
    .select("partnerId")
    .where("userId", userInfo.partnerId)
    .first();  

  const itemWant = formData.get("item-want");
  const itemOffer = formData.get("item-offer");
  const quantity = formData.get("quantity");
  const ForPartner = formData.get("for-partner");

  const itemWantInfo = await db
    .select("itemID", "valuePerUnit")
    .from("item")
    .where({ itemName: itemWant })
    .first();

  const itemOfferInfo = await db
    .select("itemID", "valuePerUnit", "userId", "amount", "itemName")
    .from("item")
    .where({ itemId: itemOffer })
    .first();

  if (itemOfferInfo?.amount < Number(quantity)) {
    return json({
      success: false,
      message:
        "You can offer a maximum of " +
        itemOfferInfo.amount +
        " units of " +
        itemOfferInfo.itemName,
    });
  }

  const wantQuantity =
    (Number(quantity) * itemOfferInfo.valuePerUnit) / itemWantInfo.valuePerUnit;

  var isOnBehalfOfPartner;
  if((partnerInfo?.partnerId === userId) && ForPartner){
    isOnBehalfOfPartner = true;
  }else{
    isOnBehalfOfPartner = false;
  }

  await db
    .insert({
      userId: itemOfferInfo.userId,
      itemId: itemOfferInfo.itemId,
      hasAmount: quantity,
      wants: itemWant,
      wantsAmount: wantQuantity,
      partnerId: isOnBehalfOfPartner ? partnerInfo.partnerId : null,
      tradeValue: 1,
    })
    .into("listing");

  return json({ success: true });
}

export default function CreateListingPage() {
  const { ownedItems, availableItems, partnerItems } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>Create Listing</H1>
        <p className="my-5">
          Please enter the details of the trade you would like to make.
        </p>
        <Form method="POST" className="flex flex-col gap-4">
          <div className="flex gap-3">
            <label htmlFor="item-offer">
              Which of your items would you like to trade?
            </label>
            <select name="item-offer" id="item-offer">
              <label htmlFor="">rah</label>
              <option>Please select</option>
              <optgroup label="Your Items">
                {!ownedItems.length && <option disabled>None</option>}
                {ownedItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.itemName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Your Partner's Items">
                {!partnerItems.length && <option disabled>None</option>}
                {partnerItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.itemName}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <LabeledTextInput
            id="quantity"
            label="How much would you like to offer?"
            type="number"
          />
          <div className="flex gap-3">
            <label htmlFor="item-want">What item are you looking for?</label>
            <select name="item-want" id="item-want">
              <option value={undefined}>Please select</option>
              {availableItems.map((item) => (
                <option key={item.itemName} value={item.itemName}>
                  {item.itemName}
                </option>
              ))}
            </select>
          </div>
            <div className="flex items-center gap-2">
            <label htmlFor="for-partner">Is this for your partner?</label>
              <input
                type="checkbox"
                id="for-partner"
                name="for-partner"
                value="true"
              />
            </div>
          {actionData?.success === false && (
            <p className="text-red-500">{actionData?.message}</p>
          )}
          <Button type="submit" disabled={actionData?.success}>
            {actionData?.success ? "Saved!" : "Submit"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
