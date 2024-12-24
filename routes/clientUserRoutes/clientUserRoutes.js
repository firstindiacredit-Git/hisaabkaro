const express = require("express");
const router = express.Router();
const clientUserController = require("../../controllers/clientUserController/clientUserController");
const authenticate = require("../../middleware/authMiddleware");

// Route to create a new client user
router.post("/create-client", authenticate, clientUserController.createClientUser);

// Route to get all client users created by the logged-in user
router.get("/getAll-clients", authenticate, clientUserController.getClientUsers);

// Route to get a single client user by ID, only if created by the logged-in user
router.get("/get-client/:id", authenticate, clientUserController.getClientUserById);

// Route to update a client user, only if created by the logged-in user
router.put("/update-client/:id", authenticate, clientUserController.updateClientUser);

// Route to delete a client user, only if created by the logged-in user
router.delete("/delete-client/:id", authenticate, clientUserController.deleteClientUser);

module.exports = router;
