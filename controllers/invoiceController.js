const Invoice = require("../models/invoiceModel");
const { validateInvoice } = require("../utils/validation");

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoiceData = { ...req.body, userId };

    // Generate unique invoice number
    if (!invoiceData.invoiceNumber) {
      const lastInvoice = await Invoice.findOne(
        { userId },
        {},
        { sort: { createdAt: -1 } }
      );
      const nextNumber = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.slice(3)) + 1
        : 1;
      invoiceData.invoiceNumber = `INV${String(nextNumber).padStart(6, "0")}`;
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error creating invoice",
      error: error.message,
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
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = { userId };

    // Add filters
    if (status) query.status = status;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (search) {
      query.$or = [
        { "billedTo.name": { $regex: search, $options: "i" } },
        { "billedTo.email": { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      sort: { [sortBy]: order === "desc" ? -1 : 1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: "-logo.dataUrl", // Exclude large logo data from list
    };

    const [invoices, total] = await Promise.all([
      Invoice.find(query, null, options),
      Invoice.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching invoices",
      error: error.message,
    });
  }
};

// Get single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching invoice",
      error: error.message,
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
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error updating invoice",
      error: error.message,
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const invoice = await Invoice.findOneAndDelete({ _id: id, userId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // TODO: Delete associated PDF file if exists

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};

// Update invoice status
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["draft", "sent", "paid", "overdue", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
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
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      message: "Invoice status updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating invoice status",
      error: error.message,
    });
  }
};

exports.saveInvoice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { template, status, subtotal, tax, total, items, invoiceNumber, date, dueDate, billingDetails } = req.body;

    // Validate required fields
    if (!template || !subtotal || !total || !items) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: template, subtotal, total, or items"
      });
    }

    const invoice = new Invoice({
      userId, // This is coming from the authenticated user
      template,
      status,
      subtotal,
      tax,
      total,
      items,
      invoiceNumber,
      date,
      dueDate,
      billingDetails
    });

    // Validate invoice before saving
    const validationError = invoice.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice data",
        error: validationError.message
      });
    }

    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice saved successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error creating invoice",
      error: error.message,
    });
  }
};

exports.sendInvoice = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = req.user._id;
    const { recipientEmail, clientId, invoiceData, template, items, subtotal, tax, total } = req.body;

    // Validate required fields
    if (!template || !subtotal || !total || !items) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: template, subtotal, total, or items"
      });
    }

    // Create invoice record with all required fields
    const invoice = new Invoice({
      userId, // This should now be properly set
      template,
      subtotal,
      tax,
      total,
      items,
      status: "sent",
      sentAt: new Date(),
      recipientEmail: recipientEmail || null,
      clientId: clientId || null,
      invoiceNumber: invoiceData.invoiceNumber,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      billingDetails: {
        from: invoiceData.billedBy,
        to: invoiceData.billedTo
      }
    });

    // Validate invoice before saving
    const validationError = invoice.validateSync();
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice data",
        error: validationError.message
      });
    }

    await invoice.save();

    // Send email logic
    const emailData = {
      to: recipientEmail || (clientId ? await getClientEmail(clientId) : null),
      from: req.user.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoiceData.billedBy.companyName}`,
      html: await generateInvoiceEmailTemplate(invoice),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: await generateInvoicePDF(invoice)
        }
      ]
    };

    await sendEmail(emailData);

    res.status(201).json({
      success: true,
      message: "Invoice sent successfully",
      data: invoice
    });

  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error sending invoice",
      error: error.message
    });
  }
};

// Helper function to get client email
const getClientEmail = async (clientId) => {
  const Client = require('../models/clientModel');
  const client = await Client.findById(clientId);
  return client ? client.email : null;
};

exports.getSavedInvoices = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user._id;

    // Fetch invoices with complete data, sorted by latest first
    const invoices = await Invoice.find({ userId })
      .select({
        invoiceNumber: 1,
        date: 1,
        dueDate: 1,
        status: 1,
        template: 1,
        items: 1,
        subtotal: 1,
        tax: 1,
        total: 1,
        billingDetails: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ createdAt: -1 });

    // Return complete invoice data
    res.status(200).json({
      success: true,
      data: invoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        template: invoice.template,
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        billingDetails: {
          from: invoice.billingDetails.from,
          to: invoice.billingDetails.to,
        },
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching saved invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};
