const bcrypt = require("bcryptjs");

// Example: in Node.js REPL
bcrypt.hash("ADMINSLSULC23", 10, (err, hash) => {
  if (err) throw err;
  console.log(hash); // Copy this hash
});