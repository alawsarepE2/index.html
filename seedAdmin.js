const bcrypt = require("bcrypt");

const rawPassword = "kimroy23";
const storedHash = "$2b$10$a39r7qn7nQHrKcoJA1480OkjaDBMJ13kD5YHc4fJkaiPi8BLhZm5G";

bcrypt.compare(rawPassword, storedHash)
  .then(result => console.log("✅ Manual bcrypt match:", result))
  .catch(err => console.error("❌ Bcrypt error:", err));
