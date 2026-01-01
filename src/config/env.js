export default function validateEnv() {
  const required = ["MONGO_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];

  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing env variable: ${key}`);
    }
  });
}
