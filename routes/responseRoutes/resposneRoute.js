const express = require("express");
const {
  addResponse,
  getResponsesByTransaction,
} = require("../../controllers/responseController/responseController");
const { authenticate } = require("../../middleware/authMiddleware"); // Assuming you have authentication middleware
const {upload} = require("../../middleware/responseMiddleware");
const router = express.Router();

//Add a response (Protected Route)
router.post("/add-response", authenticate, upload.single("file"), addResponse);

//Get responses for a transaction (Protected Route)
router.get("/get-response/:transactionId", authenticate, getResponsesByTransaction);

module.exports = router;
