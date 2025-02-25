const mongoose = require("mongoose");
const Invoice = require("../models/invoiceModel");
const { validateInvoice } = require("../utils/validation");
const Notification = require("../models/notificationModel");

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
    // Add validation for ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID format",
      });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id }, // Sender
        { recipientId: req.user._id }, // Recipient
        { "billingDetails.to.email": req.user.email }, // Fallback for recipient
      ],
    })
      .select(
        "invoiceNumber date dueDate status template items subtotal tax total billingDetails createdAt updatedAt sender recipientId sentAt isRead"
      )
      .populate("userId", "name email"); // Populate sender details

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
        sender: invoice.userId
          ? {
              name: invoice.userId.name,
              email: invoice.userId.email,
            }
          : {
              name: invoice.billingDetails.from.companyName,
              email: invoice.billingDetails.from.email,
            },
        recipientId: invoice.recipientId,
        sentAt: invoice.sentAt,
        isRead: invoice.isRead,
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
      {
        status,
        ...(status === "sent" ? { sentAt: new Date() } : {}),
      },
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

// Modify the sendInvoice controller method
exports.sentInvoice = async (req, res) => {
  try {
    const { recipientEmail, recipientId, ...invoiceData } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!recipientEmail || !recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient email and ID are required",
      });
    }

    if (!invoiceData.billingDetails?.from || !invoiceData.billingDetails?.to) {
      return res.status(400).json({
        success: false,
        message: "Billing details are required",
      });
    }

    // Create the invoice
    const invoice = new Invoice({
      ...invoiceData,
      userId,
      recipientEmail,
      recipientId,
      status: "sent",
      isRead: false,
      sentAt: new Date(),
    });

    // Validate the invoice data
    const validationError = validateInvoice(invoice);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice data",
        error: validationError,
      });
    }

    await invoice.save();

    // Send notification if configured
    if (req.app.get("sendInvoiceNotification")) {
      req.app.get("sendInvoiceNotification")(recipientEmail, {
        type: "NEW_INVOICE",
        senderName: req.user.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
      });
    }

    res.status(201).json({
      success: true,
      message: "Invoice sent successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send invoice",
    });
  }
};

// Add this new controller method for getting sent invoices
exports.getSentInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    const { sortBy = "createdAt", order = "desc" } = req.query;

    const query = {
      userId,
      status: "sent", // Only get sent invoices
    };

    const invoices = await Invoice.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .populate("template")
      .lean();

    res.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching sent invoices:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sent invoices",
      error: error.message,
    });
  }
};

// Update the getReceivedInvoices method
exports.getReceivedInvoices = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Find invoices where this user is the recipient
    const invoices = await Invoice.find({
      $or: [
        { recipientId: userId }, // Match by recipientId
        { "billingDetails.to.email": req.user.email }, // Also match by email as fallback
      ],
    }).populate("userId", "name email"); // Populate sender details

    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No invoices found for this user",
      });
    }

    // Format invoices with all required fields
    const formattedInvoices = invoices.map((invoice) => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      template: invoice.template || {},
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      billingDetails: {
        from: invoice.billingDetails.from,
        to: invoice.billingDetails.to,
      },
      sender: invoice.userId
        ? {
            name: invoice.userId.name,
            email: invoice.userId.email,
          }
        : {
            name: invoice.billingDetails.from.companyName,
            email: invoice.billingDetails.from.email,
          },
      recipientId: invoice.recipientId,
      sentAt: invoice.sentAt,
      isRead: invoice.isRead,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedInvoices,
      unreadCount: formattedInvoices.filter((invoice) => !invoice.isRead)
        .length,
    });
  } catch (error) {
    console.error("Error in getReceivedInvoices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch received invoices",
    });
  }
};

// Add a new method to mark notifications as read
exports.markInvoiceNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.updateMany(
      {
        userId: userId,
        type: "INVOICE_RECEIVED",
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};
