declare module 'express-session' {
  interface SessionData {
    validationErrors?: {
      step: string;
      errors: Record<string, unknown>;
    };
  }
}
