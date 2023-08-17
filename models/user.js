const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const USERNAME_MIN_LENGTH = 3
const PASSWORD_MIN_LENGTH = 3
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required:true,
    minLength: USERNAME_MIN_LENGTH,
    unique: true
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,    
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})
userSchema.plugin(uniqueValidator)
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = {User, USERNAME_MIN_LENGTH, PASSWORD_MIN_LENGTH}