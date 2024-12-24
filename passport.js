const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/userModel/userModel');

// Debug logs for environment variables
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('CALLBACK_URL:', process.env.CALLBACK_URL);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            passReqToCallback: true,
        },
        async function (request, accessToken, refreshToken, profile, done) {
            try {
                console.log('Profile from Google:', profile); // Debug log

                // Find user by Google ID or email
                let user = await User.findOne({ 
                    $or: [
                        { googleId: profile.id },
                        { email: profile.email }
                    ]
                });
                
                if (user) {
                    // Update existing user
                    user.googleId = profile.id;
                    user.name = profile.displayName;
                    user.profilePicture = profile.picture;
                    // Don't overwrite phone if it exists
                    if (!user.hasCompletedProfile) {
                        user.hasCompletedProfile = false;
                    }
                    await user.save();
                    console.log('Updated existing user:', user);
                } else {
                    // Create new user without phone number
                    user = new User({
                        googleId: profile.id,
                        email: profile.email,
                        name: profile.displayName,
                        profilePicture: profile.picture,
                        hasCompletedProfile: false,
                        phone: null,
                        countryCode: null
                    });
                    await user.save();
                    console.log('Created new user:', user);
                }

                return done(null, user);
            } catch (error) {
                console.error('Error in Google Strategy:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

module.exports = passport;