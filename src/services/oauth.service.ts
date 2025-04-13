import { Types } from 'mongoose';
import User from '../models/user.model';
import { tokenService } from './token.service';
import { TokenResponse } from './token.service';

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

export const oauthService = {
  /**
   * Process Google OAuth login/signup
   */
  processGoogleAuth: async (profile: GoogleProfile): Promise<TokenResponse> => {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const googleId = profile.id;
    const profilePicture = profile.photos?.[0]?.value;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ] 
    });

    if (user) {
      // Update Google ID if user logged in with email before
      if (!user.googleId) {
        user = await User.findByIdAndUpdate(
          user._id,
          { 
            googleId,
            profilePicture: profilePicture || user.profilePicture
          },
          { new: true }
        );
      }
    } else {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture,
        // No password for OAuth users
      });
    }

    // Add null check before accessing user._id
    if (!user) {
      throw new Error('Failed to create or retrieve user');
    }

    // Generate authentication tokens
    return tokenService.generateAuthTokens(user._id);
  }
}; 