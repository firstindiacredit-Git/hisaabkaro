
const admin = require("firebase-admin");

// Load Firebase Admin credentials (Download from Firebase Console)
const serviceAccount = require("./config/firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
