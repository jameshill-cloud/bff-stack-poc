export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  mockApiBaseUrl: process.env.MOCK_API_BASE_URL || "http://localhost:3001",
  sessionSecret: process.env.SESSION_SECRET || "dev-secret",
  nodeEnv: process.env.NODE_ENV || "development",
});
