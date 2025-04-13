import env from './env';

export default {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production',
    expiresIn: '15m', // Short-lived
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
    expiresIn: '7d', // Longer-lived
  },
}; 