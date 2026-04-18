// tests/credentials.js
// Update these before running tests

module.exports = {

  // Student account
  STUDENT: {
    email:    "it23344174@my.sliit.lk",
    password: "Thisula@123",
  },

  // Main admin account
  MAIN_ADMIN: {
    email:    "admin@clubsphear.com",
    password: "Admin@1234",
  },

  // Club account
  CLUB: {
    email:    "aiesec@clubsphear.com",
    password: "Club@12345",
  },

  BASE_URL: process.env.TEST_BASE_URL || "http://localhost:3000",
};
