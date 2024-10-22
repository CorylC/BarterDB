import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";
import Button from "~/src/components/Button";
import LabeledTextInput from "~/src/components/LabeledTextInput";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  const allItemsData = await db
    .select("itemName", "valuePerUnit")
    .from("item")
    .distinct("itemName");

  var data;
  try {
    data = await db
      .select("itemId", "amount", "itemName", "valuePerUnit")
      .from("item")
      .where("userId", userId);
  } catch (error) {
    data = [
      {
        itemID: "",
        userID: "",
        amount: "",
        itemName: "There are no Items",
        inMovement: "",
        valuePerUnit: "",
      },
    ];
  }

  return { data, userId, allItemsData };
}

export const action: ActionFunction = async ({ request }) => {
  const ret = {
    errors: {
      ItemName: "",
      amount: "",
    },
  };

  const { userId } = await getUserInfoFromCookie(request);
  const formData = await request.formData();
  const ItemName = formData.get("ItemName");
  const amount = formData.get("amount") as string;

  if (!ItemName) {
    ret.errors.ItemName = "ItemName is required";
  }

  if (!amount) {
    ret.errors.amount = "amount is required";
  }

  if (ret.errors.ItemName || ret.errors.amount) {
    return ret;
  }

  // if the form structure is valid, check the db
  const itemValue = await db
    .select("*")
    .from("item")
    .andWhere("itemName", ItemName);

  var nextId = await db("item").max("itemId as maxId");
  const ItemId = nextId[0].maxId + 1;
  const specificVal = itemValue[0]?.valuePerUnit ?? 10;
  const inmovement = false;

  const newItem = {
    itemID: ItemId,
    userID: userId,
    amount: amount,
    itemName: ItemName,
    inMovement: false,
    valuePerUnit: specificVal,
  };

  const data = await db.insert(newItem).into("item");

  return ret;
};

export default function myItems() {
  const { data, allItemsData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col items-center w-[95vw] justify-around">
        <div className="flex flex-col items-center">
          <H1>Current Items:</H1>
          <div>
            {data.map((item) => (
              <p key={item.itemID}>
                Name: {item.itemName}, Amount: {item.amount}, Value per Unit:{" "}
                {item.valuePerUnit}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <H1 className="mb-10">Add an Item</H1>
          <Form method="POST" className="flex flex-col gap-4 items-center">
            <div className="flex flex-col gap-4 items-center">
              <select name="ItemName" id="ItemName">
                {allItemsData.map((item) => (
                  <option key={item.itemName} value={item.itemName}>
                    {item.itemName}
                  </option>
                ))}
              </select>
              <LabeledTextInput
                id="amount"
                label="amount"
                errorMessage={actionData?.errors?.amount}
                placeholder="0"
              />
            </div>
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
