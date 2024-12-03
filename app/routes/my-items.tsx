import { ActionFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import H1 from "~/src/components/H1";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import db from "~/db.server";
import Button from "~/src/components/Button";

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);

  const allItemsData = await db
    .select("itemName", "valuePerUnit")
    .from("item")
    .distinct("itemName");

  let data;
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
      newAmount: "",
    },
  };

  const { userId } = await getUserInfoFromCookie(request);
  const formData = await request.formData();
  const ItemName = formData.get("ItemName");
  const newAmount = formData.get("amount") as string;
  const removeAmount = formData.get("removeAmount") as string;

  if (!ItemName) {
    ret.errors.ItemName = "ItemName is required";
  }

  if (!newAmount && !removeAmount) {
    ret.errors.newAmount = "amount is required";
  }

  if (ret.errors.ItemName || ret.errors.newAmount) {
    return ret;
  }

  // if the form structure is valid, check the db
  const itemValue = await db
    .select("*")
    .from("item")
    .where("itemName", ItemName);

  var nextId = await db("item").max("itemId as maxId");
  const ItemId = nextId[0].maxId + 1;
  const specificVal = itemValue[0]?.valuePerUnit ?? 10;
  var currentSet;
  try {
    currentSet = await db
      .table("item")
      .where("itemName", ItemName)
      .andWhere("userId", userId)
      .pluck("amount")
      .then(function (amounts) {
        return amounts[0];
      });
  } catch (error) {
    currentSet = 0;
  }

  if (typeof currentSet == "undefined") {
    if (newAmount) {
      const newItem = {
        itemID: ItemId,
        userID: userId,
        amount: newAmount,
        itemName: ItemName,
        inMovement: false,
        valuePerUnit: specificVal,
      };

      await db.insert(newItem).into("item");
    }
  } else {
    if (newAmount) {
      await db
        .table("item")
        .where("itemName", ItemName)
        .andWhere("userId", userId)
        .update("amount", currentSet + Number(newAmount));
    }

    if (removeAmount) {
      const updatedAmount = currentSet - Number(removeAmount);
      if (updatedAmount > 0) {
        await db
          .table("item")
          .where("itemName", ItemName)
          .andWhere("userId", userId)
          .update("amount", updatedAmount);
      } else {
        await db
          .table("item")
          .where("itemName", ItemName)
          .andWhere("userId", userId)
          .del();
      }
    }
  }

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
              <div key={item.itemID} className="flex items-center gap-4">
                <p>
                  Name: {item.itemName}, Amount: {item.amount}, Value per Unit: {" "}
                  {item.valuePerUnit}
                </p>
                <Form method="POST" className="flex gap-2 items-center">
                  <input type="hidden" name="ItemName" value={item.itemName} />
                  <input
                    id="removeAmount"
                    name="removeAmount"
                    type="number"
                    placeholder="0"
                    className="border rounded px-2"
                  />
                  <Button type="submit">Remove</Button>
                </Form>
              </div>
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
              <input
                id="amount"
                name="amount"
                type="number"
                placeholder="0"
                className="border rounded px-2"
              />
            </div>
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}