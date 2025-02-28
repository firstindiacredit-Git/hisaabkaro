const express = require('express');
const router = express.Router();
const { authenticate}  = require('../middleware/authMiddleware');
const invoiceController = require('../controllers/invoiceController');

// All routes are protected with auth middleware


// Create new invoice
router.post('/', authenticate,invoiceController.createInvoice);

// Get all invoices
router.get('/', authenticate, invoiceController.getAllInvoices);

// Get single invoice
router.get('/:id',authenticate, invoiceController.getInvoiceById);

// Update invoice
router.put('/:id',authenticate, invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id',authenticate, invoiceController.deleteInvoice);

// Update invoice status
router.patch('/:id/status',authenticate, invoiceController.updateInvoiceStatus);

module.exports = router; 