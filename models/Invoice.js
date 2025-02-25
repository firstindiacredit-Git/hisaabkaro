const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    currency: {
      type: String,
      default: "INR",
    },
    billedBy: {
      companyName: String,
      address: String,
      phone: String,
      email: String,
      gst: String,
      pan: String,
    },
    billedTo: {
      name: String,
      address: String,
      phone: String,
      email: String,
      gst: String,
      pan: String,
    },
    items: [
      {
        description: String,
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    tax: {
      enabled: {
        type: Boolean,
        default: false,
      },
      rate: {
        type: Number,
        min: 0,
        max: 100,
      },
      label: {
        type: String,
        default: "Tax",
      },
    },
    discount: {
      enabled: {
        type: Boolean,
        default: false,
      },
      rate: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    termsAndConditions: [String],
    logo: {
      dataUrl: String,
      scale: {
        type: Number,
        default: 100,
        min: 1,
        max: 200,
      },
    },
    colors: {
      headerBackground: {
        type: String,
        default: "#f8f9fa",
      },
      accentColor: {
        type: String,
        default: "#007bff",
      },
      textColor: {
        type: String,
        default: "#212529",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    pdfUrl: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totals
invoiceSchema.pre("save", function (next) {
  // Calculate item totals
  this.items.forEach((item) => {
    item.total = item.quantity * item.price;
  });

  // Calculate invoice totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.taxAmount = this.tax.enabled ? (this.subtotal * this.tax.rate) / 100 : 0;
  this.discountAmount = this.discount.enabled
    ? (this.subtotal * this.discount.rate) / 100
    : 0;
  this.total = this.subtotal + this.taxAmount - this.discountAmount;

  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
