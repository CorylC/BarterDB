import db from "~/db.server";

export default async function getPendingTransactions() {
  const pendingTransactions = await db
    .select(
      "transactions.transactionId",
      "transactions.firstHalfHash",
      "transactions.secondHalfHash",
      "transactions.fullHash",
      "transactions.listing1",
      "transactions.listing2",
      "l1.wants AS wants1",
      "l1.wantsAmount AS wantsAmount1",
      "u1.username AS username1",
      "l2.wants AS wants2",
      "l2.wantsAmount AS wantsAmount2",
      "u2.username AS username2"
    )
    .from("transactions")
    .join("listing AS l1", "l1.listingId", "transactions.listing1")
    .join("listing AS l2", "l2.listingId", "transactions.listing2")
    .join("users AS u1", "u1.userId", "l1.userId")
    .join("users AS u2", "u2.userId", "l2.userId")
    .whereNull("firstHalfHash")
    .orWhereNull("secondHalfHash");

  return pendingTransactions;
}
