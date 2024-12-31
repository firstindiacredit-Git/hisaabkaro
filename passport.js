const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/userModel/userModel');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            passReqToCallback: true,
            scope: ['email', 'profile'],
            proxy: true // Add this for secure proxy
        },
        async function (request, accessToken, refreshToken, profile, done) {
            try {
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
                    user.email = profile.email;
                    user.profilePicture = profile.picture;
                    if (!user.hasCompletedProfile) {
                        user.hasCompletedProfile = false;
                    }
                    await user.save();
                } else {
                    // Create new user
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