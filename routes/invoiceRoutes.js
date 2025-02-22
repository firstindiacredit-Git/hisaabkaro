const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const invoiceController = require("../controllers/invoiceController");

// All routes are protected with auth middleware

// Create new invoice
router.post("/save-invoice", authenticate, invoiceController.createInvoice);

// Get all invoices with filtering and pagination
router.get("/saved-invoice", authenticate, invoiceController.getAllInvoices);

// Get single invoice
router.get("/:id", authenticate, invoiceController.getInvoiceById);

// Update invoice
router.put("/:id", authenticate, invoiceController.updateInvoice);

// Delete invoice
router.delete("/:id", authenticate, invoiceController.deleteInvoice);

// Update invoice status
router.patch(
  "/:id/status",
  authenticate,
  invoiceController.updateInvoiceStatus
);

// Add this line back if you need specific send functionality
router.post("/send-invoice", authenticate, invoiceController.sendInvoice);

module.exports = router;
