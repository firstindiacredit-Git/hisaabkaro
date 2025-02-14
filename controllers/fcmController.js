const admin = require("../firebase-admin");
const Token = require("../models/tokenModel/Token");

const fcmController = {
  // Save or update FCM token
  saveToken: async (req, res) => {
    try {
      const { token } = req.body;
      // Get userId from authenticated user
      const userId = req.user.id; // or req.user._id depending on your auth setup

      if (!token || !userId) {
        return res.status(400).json({ 
          success: false, 
          message: "Token and userId are required" 
        });
      }
  
      const newToken = await Token.findOneAndUpdate(
        { userId },  // Ensure each user has only one token
        { token, userId }, 
        { upsert: true, new: true }
      ).populate("userId", "name email"); // Fetch user details
  
      res.status(200).json({ 
        success: true,
        message: "Token saved successfully", 
        token: newToken 
      });
    } catch (error) {
      console.error("Error saving FCM token:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error saving token" 
      });
    }
  },
  

  // Send FCM notification to a specific token
  sendToToken: async (req, res) => {
    try {
      const { token, title, body, data } = req.body;
      
      if (!token || !title || !body) {
        return res.status(400).json({ 
          success: false, 
          message: "Token, title, and body are required" 
        });
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await admin.messaging().send(message);
      res.status(200).json({ 
        success: true,
        message: "Notification sent successfully", 
        response 
      });
    } catch (error) {
      console.error("Error sending FCM notification:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error sending notification" 
      });
    }
  },

  // Send FCM notification to multiple tokens
  sendToMultiple: async (req, res) => {
    try {
      const { tokens, title, body, data } = req.body;
      
      if (!tokens || !Array.isArray(tokens) || !title || !body) {
        return res.status(400).json({ 
          success: false, 
          message: "Tokens array, title, and body are required" 
        });
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      res.status(200).json({ 
        success: true,
        message: "Notifications sent successfully", 
        response: {
          successCount: response.successCount,
          failureCount: response.failureCount,
        }
      });
    } catch (error) {
      console.error("Error sending FCM notifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error sending notifications" 
      });
    }
  },

  // Send FCM notification to all stored tokens
  sendToAll: async (req, res) => {
    try {
      const { title, body, data } = req.body;
      
      if (!title || !body) {
        return res.status(400).json({ 
          success: false, 
          message: "Title and body are required" 
        });
      }

      const tokens = await Token.find({});
      const tokenValues = tokens.map(t => t.token);

      if (tokenValues.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No tokens found" 
        });
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens: tokenValues,
      };

      const response = await admin.messaging().sendMulticast(message);
      res.status(200).json({ 
        success: true,
        message: "Notifications sent successfully", 
        response: {
          successCount: response.successCount,
          failureCount: response.failureCount,
          tokens: tokenValues.length
        }
      });
    } catch (error) {
      console.error("Error sending FCM notifications:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error sending notifications" 
      });
    }
  },

  // Delete FCM token
  deleteToken: async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ 
          success: false, 
          message: "Token is required" 
        });
      }

      await Token.deleteOne({ token });

      res.status(200).json({ 
        success: true,
        message: "Token deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting FCM token:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error deleting token" 
      });
    }
  }
};

module.exports = fcmController; 