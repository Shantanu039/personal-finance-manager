import express from "express";
import {
  addTransactionController,
  deleteTransactionController,
  getAllTransactionController,
  updateTransactionController
} from "../controllers/transactionController.js";

const router = express.Router();

// ✅ Ensure consistency in route names
router.post("/addTransaction", addTransactionController);
router.post("/getTransaction", getAllTransactionController); // 🔹 Fixed incorrect route name
router.post("/deleteTransaction/:id", deleteTransactionController);
router.put("/updateTransaction/:id", updateTransactionController);

export default router;
