const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../Models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: "http://localhost:3000/auth/google/callback",
      callbackURL:
        "https://sasa-business-listing-app-f231d83a4bc5.herokuapp.com/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      const userEmail = profile?._json.email;
      const provider = profile?.provider;

      try {
        const existingUser = await User.findOne({ email: userEmail });

        if (!existingUser) {
          const user = new User({
            email: userEmail,
            isVerified: true,
            isAdmin: false,
            provider,
          });

          await user.save();
        }
      } catch (error) {
        console.log(error);
      }

      callback(null, { profile, accessToken });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
