require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters");
  process.exit(1);
}

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});