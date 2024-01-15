const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});


userSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });

  if (!user) {
    return null; 
  }

  
  if (user.password !== password) {
    return null; 
  }

  return user; 
};

const User = mongoose.model('User', userSchema);

module.exports = User;




