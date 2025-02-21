const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const invoiceController = require("../controllers/invoiceController");

// All routes are protected with auth middleware

// Create new invoice
router.post("/save-invoice", auth, invoiceController.createInvoice);

// Get all invoices
router.get("/saved-invoices", auth, invoiceController.getAllInvoices);

// Get single invoice
router.get("/:id", auth, invoiceController.getInvoiceById);

// Update invoice
router.put("/:id", auth, invoiceController.updateInvoice);

// Delete invoice
router.delete("/:id", auth, invoiceController.deleteInvoice);

// Update invoice status
router.patch("/:id/status", auth, invoiceController.updateInvoiceStatus);

// New routes for saving and sending invoices
router.post("/send-invoice", auth, invoiceController.sendInvoice);

module.exports = router;
