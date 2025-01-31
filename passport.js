const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("./models/userModel/userModel");

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id); // Serialize only the user ID for session storage
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user ID:", id);
    const user = await User.findById(id);
    if (!user) {
      console.error("User not found during deserialization");
      return done(new Error("User not found"), null);
    }
    done(null, user); // Attach user object to the session
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ["email", "profile"],
      passReqToCallback: true, // Pass request object to the callback function
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Received Google profile:", {
          id: profile.id,
          email: profile.email,
          name: profile.displayName,
        });

        // Look for an existing user by email
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.email }],
        });
        if (!user) {
          console.log("Creating new user for:", profile.email);
          // Create new user if not found
          user = await User.create({
            email: profile.email,
            name: profile.displayName,
            profilePicture: profile.picture || "default_picture_url", // Fallback in case no picture
            provider: "google",
            phone: null,
            countryCode: null,
            googleId: profile.id,
          });
        } else {
          console.log("Found existing user:", user.email);
          // Update existing user's Google-specific info
          user.googleId = profile.id;
          user.name = profile.displayName;
          // Only set profile picture if user hasn't uploaded a custom one
          if (!user.hasCustomProfilePicture) {
            user.profilePicture = profile.picture;
          }
          // Don't overwrite phone if it exists
          if (!user.hasCompletedProfile) {
            user.hasCompletedProfile = false;
          }
          await user.save();
        }

        return done(null, user); // Return the user object after successful authentication
      } catch (error) {
        console.error("Error in Google strategy:", error);
        return done(error, null); // Pass error to the callback
      }
    }
  )
);

module.exports = passport;
