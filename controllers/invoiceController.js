const Invoice = require('../models/Invoice');
const { validateInvoice } = require('../utils/validation');

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user._id;
    const invoiceData = { ...req.body, userId };

    // Generate unique invoice number
    if (!invoiceData.invoiceNumber) {
      const lastInvoice = await Invoice.findOne({ userId }, {}, { sort: { 'createdAt': -1 } });
      const nextNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.slice(3)) + 1 : 1;
      invoiceData.invoiceNumber = `INV${String(nextNumber).padStart(6, '0')}`;
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

// Get all invoices with filtering and pagination
exports.getAllInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      startDate, 
      endDate,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { userId };

    // Add filters
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      query.$or = [
        { 'billedTo.name': { $regex: search, $options: 'i' } },
        { 'billedTo.email': { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      sort: { [sortBy]: order === 'desc' ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: '-logo.dataUrl' // Exclude large logo data from list
    };

    const [invoices, total] = await Promise.all([
      Invoice.find(query, null, options),
      Invoice.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

// Get single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const invoiceId = req.params.id;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, userId: req.user._id },
      invoiceData,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // TODO: Delete associated PDF file if exists

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

// Update invoice status
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice status',
      error: error.message
    });
  }
}; 