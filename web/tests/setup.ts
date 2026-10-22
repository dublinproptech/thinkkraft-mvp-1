// Environment for the test run.
//
// Nothing here is a real credential and nothing here reaches a real service.
// The route handlers under test are unplugged from the database and from
// NextAuth by the mocks in the test files; these values exist only so that
// importing a module which reads them at load time does not throw.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET ??= "test-secret-not-a-real-one";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
process.env.AI_SERVICE_URL ??= "http://localhost:8000";
