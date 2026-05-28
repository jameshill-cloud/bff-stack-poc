import session from 'express-session';

export const sessionMiddleware = (sessionSecret: string) =>
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  });
