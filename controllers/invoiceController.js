const Invoice = require("../models/invoiceModel");
const { validateInvoice } = require("../utils/validation");

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const invoiceData = { ...req.body, userId };

    // Validate invoice data
    const validationError = validateInvoice(invoiceData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice data",
        error: validationError,
      });
    }

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

    // Return consistent response format
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: {
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
      },
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
    const userId = req.userId;
    const {
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
        { invoiceNumber: { $regex: search, $options: "i" } },
        {
          "billingDetails.from.companyName": { $regex: search, $options: "i" },
        },
        { "billingDetails.to.name": { $regex: search, $options: "i" } },
        { "billingDetails.to.email": { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      sort: { [sortBy]: order === "desc" ? -1 : 1 },
    };

    // Get raw data from MongoDB
    const invoices = await Invoice.find(query)
      .sort(options.sort)
      .populate("template")
      .lean();

    // Return response with all invoice data including template
    res.json({
      success: true,
      data: invoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        template: {
          _id: invoice.template?._id,
          name: invoice.template?.name,
          description: invoice.template?.description,
          layout: invoice.template?.layout,
          style: invoice.template?.style,
        },
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
    }).select(
      "invoiceNumber date dueDate status template items subtotal tax total billingDetails createdAt updatedAt"
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.json({
      success: true,
      data: {
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
      },
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
    ).select(
      "invoiceNumber date dueDate status template items subtotal tax total billingDetails createdAt updatedAt"
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
      data: {
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
      },
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
    const validStatuses = ["saved", "sent", "paid", "overdue", "cancelled"];

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
      data: invoice.template,
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

// Get saved invoices
exports.getSavedInvoices = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy = "createdAt", order = "desc" } = req.query;

    const query = { userId };
    const options = {
      sort: { [sortBy]: order === "desc" ? -1 : 1 },
    };

    const invoices = await Invoice.find(query)
      .sort(options.sort)
      .populate("template")
      .lean();

    res.json({
      success: true,
      data: invoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        dueDate: invoice.dueDate,
        status: invoice.status,
        template: {
          _id: invoice.template?._id,
          name: invoice.template?.name,
          description: invoice.template?.description,
          layout: invoice.template?.layout,
          style: invoice.template?.style,
        },
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
      message: "Error fetching saved invoices",
      error: error.message,
    });
  }
};

// Add this back to the controller if needed
exports.sendInvoice = async (req, res) => {
  try {
    const userId = req.user._id;
    const invoiceData = {
      ...req.body,
      userId,
      status: "sent",
      sentAt: new Date(),
    };

    // Validate invoice data
    const validationError = validateInvoice(invoiceData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice data",
        error: validationError,
      });
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: "Invoice sent successfully",
      data: {
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
        sentAt: invoice.sentAt,
      },
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error sending invoice",
      error: error.message,
    });
  }
};
