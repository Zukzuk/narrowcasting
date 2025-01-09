import 'express-session';

/**
 * Extends the express session data to include the userId
 */
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}