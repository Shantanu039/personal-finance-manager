import Transaction from "../models/TransactionModel.js";
import User from "../models/UserSchema.js";
import moment from "moment";

// ✅ Modified to handle recurring transactions
export const addTransactionController = async (req, res) => {
  try {
    const {
      title,
      amount,
      description,
      date,
      category,
      userId,
      transactionType,
      recurring,
    } = req.body;

    if (!title || !amount || !description || !date || !category || !transactionType) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const newTransaction = await Transaction.create({
      title,
      amount,
      category,
      description,
      date,
      user: userId,
      transactionType,
      recurring,
    });

    user.transactions.push(newTransaction._id); // Push the transaction ID
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction Added Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ Modified to include recurring transactions processing
export const getAllTransactionController = async (req, res) => {
  try {
    const { userId, type, frequency, startDate, endDate } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const query = { user: userId };

    if (type !== "all") {
      query.transactionType = type;
    }

    if (frequency !== "custom") {
      query.date = { $gt: moment().subtract(Number(frequency), "days").toDate() };
    } else if (startDate && endDate) {
      query.date = { $gte: moment(startDate).toDate(), $lte: moment(endDate).toDate() };
    }

    const transactions = await Transaction.find(query);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ Recurring Transaction Auto-Addition (Run on Server Startup)
import cron from "node-cron";

cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("🔄 Running recurring transactions job...");

    const recurringTransactions = await Transaction.find({ recurring: true });

    for (let transaction of recurringTransactions) {
      const newTransaction = new Transaction({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.transactionType,
        category: transaction.category,
        description: transaction.description,
        date: new Date(), // ✅ New transaction with updated date
        recurring: true,
        user: transaction.user, // ✅ Keep same user
      });

      await newTransaction.save();
    }

    console.log("✅ Recurring transactions added successfully!");
  } catch (error) {
    console.error("❌ Error processing recurring transactions:", error);
  }
});

// ✅ Delete transaction (No Changes)
export const deleteTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const transactionElement = await Transaction.findByIdAndDelete(transactionId);

    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    user.transactions = user.transactions.filter(
      (transaction) => transaction._id.toString() !== transactionId
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ✅ Update Transaction (Added recurring field support)
export const updateTransactionController = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { title, amount, description, date, category, transactionType, recurring } = req.body;

    const transactionElement = await Transaction.findById(transactionId);

    if (!transactionElement) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (title) transactionElement.title = title;
    if (description) transactionElement.description = description;
    if (amount) transactionElement.amount = amount;
    if (category) transactionElement.category = category;
    if (transactionType) transactionElement.transactionType = transactionType;
    if (date) transactionElement.date = date;
    if (recurring !== undefined) transactionElement.recurring = recurring; // ✅ Allow updating recurring flag

    await transactionElement.save();

    return res.status(200).json({
      success: true,
      message: "Transaction Updated Successfully",
      transaction: transactionElement,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
