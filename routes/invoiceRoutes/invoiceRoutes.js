const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const invoiceController = require("../../controllers/invoiceController/invoiceController");

// Get received and sent invoices - these should come BEFORE /:id routes
router.get(
  "/received-invoices",
  authenticate,
  invoiceController.getReceivedInvoices
);
router.get("/sent-invoices", authenticate, invoiceController.getSentInvoices);
router.get("/saved-invoice", authenticate, invoiceController.getAllInvoices);

// Create and send invoices
router.post("/save-invoice", authenticate, invoiceController.createInvoice);
router.post("/sent-invoice", authenticate, invoiceController.sentInvoice);

// Single invoice operations - these should come AFTER other specific routes
router.get("/:id", authenticate, invoiceController.getInvoiceById);
router.put("/:id", authenticate, invoiceController.updateInvoice);
router.delete("/:id", authenticate, invoiceController.deleteInvoice);
router.patch(
  "/:id/status",
  authenticate,
  invoiceController.updateInvoiceStatus
);

module.exports = router;
