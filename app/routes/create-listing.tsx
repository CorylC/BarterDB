import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import LabeledTextInput from "~/src/components/LabeledTextInput";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const { userId } = await getUserInfoFromCookie(request);
  const ownedItems = await db
    .select("itemName", "itemID")
    .distinct("itemName")
    .from("item")
    .where({ userId });
  const availableItems = await db.select("itemName").distinct().from("item");

  return json({ ownedItems, availableItems });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { userId } = await getUserInfoFromCookie(request);

  const itemWant = formData.get("item-want");
  const itemOffer = formData.get("item-offer");
  const quantity = formData.get("quantity");

  const itemWantInfo = await db
    .select("itemID", "valuePerUnit")
    .from("item")
    .where({ itemName: itemWant })
    .first();
  const itemOfferInfo = await db
    .select("itemID", "valuePerUnit")
    .from("item")
    .where({ itemName: itemOffer })
    .first();

  const wantQuantity =
    (Number(quantity) * itemOfferInfo.valuePerUnit) / itemWantInfo.valuePerUnit;

  await db.insert({
    userId,
    itemId: itemOfferInfo.itemID,
    hasAmount: quantity,
    wants: itemWant,
    wantsAmount: wantQuantity,
    partnerId: null,
    tradeValue: 1,
  });

  return json({ success: true });
}

export default function CreateListingPage() {
  const { ownedItems, availableItems } = useLoaderData<typeof loader>();

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
              <option>Please select</option>
              {ownedItems.map((item) => (
                <option key={item.itemName} value={item.itemName}>
                  {item.itemName}
                </option>
              ))}
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
          <Button type="submit">Submit</Button>
        </Form>
      </div>
    </div>
  );
}
