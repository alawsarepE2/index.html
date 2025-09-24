// verifyPassword.js
const bcrypt = require('bcryptjs'); // or 'bcrypt'
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://jeyceesirc_db_user:rgcN8v0cDyyD5iFW@school-cluster.cpmv0lb.mongodb.net/schoolclinic', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function verifyAdmin() {
  const admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) return console.log('Admin user not found');

  const plainPassword = 'ADMINSLSULC23'; // the password you hashed
  const isMatch = await bcrypt.compare(plainPassword, admin.password);

  console.log(isMatch ? '✅ Password matches!' : '❌ Password does not match!');
  mongoose.connection.close();
}

verifyAdmin();
