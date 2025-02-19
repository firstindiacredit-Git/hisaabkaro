exports.validateInvoice = (invoiceData) => {
  // Basic validation
  if (!invoiceData.date) {
    return 'Invoice date is required';
  }

  if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
    return 'Invoice must have at least one item';
  }

  // Validate items
  for (const item of invoiceData.items) {
    if (!item.description) {
      return 'Item description is required';
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return 'Item quantity must be a positive number';
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return 'Item price must be a non-negative number';
    }
  }

  // Validate tax and discount if enabled
  if (invoiceData.tax?.enabled) {
    if (typeof invoiceData.tax.rate !== 'number' || invoiceData.tax.rate < 0) {
      return 'Tax rate must be a non-negative number';
    }
  }

  if (invoiceData.discount?.enabled) {
    if (typeof invoiceData.discount.rate !== 'number' || invoiceData.discount.rate < 0) {
      return 'Discount rate must be a non-negative number';
    }
  }

  return null;
}; 