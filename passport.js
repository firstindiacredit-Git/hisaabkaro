const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('./models/userModel/userModel');

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.email);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user ID:', id);
        const user = await User.findById(id);
        if (!user) {
            console.error('User not found during deserialization');
            return done(new Error('User not found'), null);
        }
        done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            passReqToCallback: true
        },
        async (request, accessToken, refreshToken, profile, done) => {
            try {
                console.log('Received Google profile:', {
                    id: profile.id,
                    email: profile.email,
                    name: profile.displayName
                });

                let user = await User.findOne({ email: profile.email });

                if (!user) {
                    console.log('Creating new user for:', profile.email);
                    user = await User.create({
                        email: profile.email,
                        name: profile.displayName,
                        profilePicture: profile.picture || 'default_picture_url',  // Fallback in case no picture
                        provider: 'google',
                        googleId: profile.id
                    });
                } else {
                    console.log('Found existing user:', user.email);
                    // Update existing user's Google-specific info
                    user.googleId = profile.id;
                    user.profilePicture = profile.picture || user.profilePicture;
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                console.error('Error in Google strategy:', error);
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
