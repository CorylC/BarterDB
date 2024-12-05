import { redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import Button from "~/src/components/Button";
import H1 from "~/src/components/H1";
import H3 from "~/src/components/H3";
import Sidebar from "~/src/components/Sidebar";
import { getUserInfoFromCookie } from "~/src/helpers/auth";
import getPendingTransactions from "~/src/helpers/getPendingTransactions";

export const ADMIN_USER_IDS = [0];

export async function loader({ request }) {
  const { userId } = await getUserInfoFromCookie(request);
  if (userId === undefined || !ADMIN_USER_IDS.includes(userId)) {
    throw redirect("/");
  }

  const pendingTransactions = await getPendingTransactions();

  return { pendingTransactions };
}

export async function action({ request }) {
  const formData = await request.formData();

  const _action = formData.get("_action");

  if (_action === "APPROVE") {
    const transactionId = formData.get("transactionId");
    const hashHalf = formData.get("hashHalf");

    const transaction = await db("transactions")
      .select("fullHash", "firstHalfHash", "secondHalfHash", "listing1", "listing2")
      .where("transactionId", transactionId)
      .first();

    if (!transaction) {
      return { success: false, message: "Transaction not found." };
    }

    const { fullHash, firstHalfHash, secondHalfHash } = transaction;

    if (hashHalf === fullHash.slice(0, 8)) {
      // Approving the first half
      await db("transactions")
        .update({ firstHalfHash: hashHalf })
        .where("transactionId", transactionId);
    } else if (hashHalf === fullHash.slice(8, 16)) {
      // Approving the second half
      await db("transactions")
        .update({ secondHalfHash: hashHalf })
        .where("transactionId", transactionId);
    } else {
      // Invalid hash
      return { success: false, message: "Invalid hash." };
    }

    // Check if both sides are approved
    const updatedTransaction = await db("transactions")
      .select("firstHalfHash", "secondHalfHash")
      .where("transactionId", transactionId)
      .first();

    if (updatedTransaction.firstHalfHash && updatedTransaction.secondHalfHash) {
      // Both sides are approved, remove the transaction from the database
      const firstItem = await db.select("itemId").from("listing").where("listingId", transaction.listing1);
      const secondItem = await db.select("itemId").from("listing").where("listingId", transaction.listing2)
      
      await db.table("item").where("itemId", firstItem[0].itemId).del();
      await db.table("item").where("itemId", secondItem[0].itemId).del();
      return { success: true, message: "Trade approved and transaction removed." };
    }

    return { success: true, message: "Trade approved for one side." };
  }

  return { success: false, message: "Invalid action." };
}

export default function AdminDashboard() {
  const { pendingTransactions } = useLoaderData<typeof loader>();

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <H1>Admin Dashboard</H1>
        <H3 className="mt-4">Pending Trades</H3>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {pendingTransactions.map((transaction) => (
            <TransactionDisplay
              key={transaction.transactionId}
              transaction={transaction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionDisplay({ transaction }) {
  return (
    <div className="border border-black p-4">
      <p className="font-bold">Transaction ID: {transaction.transactionId}</p>
      <div className="flex gap-3 items-center">
        <SideOfTrade
          userName={transaction.username1}
          itemName={transaction.wants2}
          transactionId={transaction.transactionId}
          hashHalf={transaction.fullHash.slice(0, 8)}
          itemAmount={transaction.wantsAmount2}
          approved={!!transaction.firstHalfHash}
        />
        <SideOfTrade
          userName={transaction.username2}
          itemName={transaction.wants1}
          transactionId={transaction.transactionId}
          hashHalf={transaction.fullHash.slice(8, 16)}
          itemAmount={transaction.wantsAmount1}
          approved={!!transaction.secondHalfHash}
        />
      </div>
    </div>
  );
}

function SideOfTrade({
  userName,
  itemName,
  transactionId,
  hashHalf,
  itemAmount,
  approved,
}: {
  userName: string;
  itemName: string;
  transactionId: number;
  hashHalf: string;
  itemAmount: number;
  approved: boolean;
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="PATCH">
      <p>User: {userName}</p>
      <p>
        Sending: {itemAmount} {itemName}
      </p>
      <p>Secure Key: {hashHalf}</p>
      <input type="hidden" name="transactionId" value={transactionId} />
      <input type="hidden" name="hashHalf" value={hashHalf} />
      {approved ? (
        <p className="py-2 px-3 rounded-lg bg-green-400 w-fit">Approved ✓</p>
      ) : (
        <Button type="submit" name="_action" value="APPROVE">
          Approve
        </Button>
      )}
    </fetcher.Form>
  );
}
