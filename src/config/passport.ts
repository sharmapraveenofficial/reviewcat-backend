import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import oauth from './oauth';
import User from '../models/user.model';

export const setupPassport = (): void => {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: oauth.google.clientID,
    clientSecret: oauth.google.clientSecret,
    callbackURL: oauth.google.callbackURL,
    scope: ['profile', 'email'],
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      return done(null, profile);
    } catch (error) {
      return done(error as Error);
    }
  }));

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user
  passport.deserializeUser((obj, done) => {
    done(null, obj as Express.User);
  });
}; 