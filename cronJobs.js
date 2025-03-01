import cron from "node-cron";
import Transaction from "./models/TransactionModel.js";

// 🔹 Run this job on the 1st day of every month at midnight
cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("🔄 Running recurring transactions job...");

    const recurringTransactions = await Transaction.find({ recurring: true });

    for (let transaction of recurringTransactions) {
      const newTransaction = new Transaction({
        title: transaction.title,
        amount: transaction.amount,
        transactionType: transaction.transactionType, // ✅ Fixed type field
        category: transaction.category,
        description: transaction.description,
        date: new Date(), // 🔹 Set new date
        recurring: true,
        user: transaction.user, // ✅ Keep the same user
      });

      await newTransaction.save();
    }

    console.log("✅ Recurring transactions added successfully!");
  } catch (error) {
    console.error("❌ Error processing recurring transactions:", error);
  }
});
