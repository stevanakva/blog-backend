const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const {User} = require('../models/user')
const {USERNAME_MIN_LENGTH} = require('../models/user')
const {PASSWORD_MIN_LENGTH} = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', {url: 1, title: 1, author: 1})
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || username.length < USERNAME_MIN_LENGTH) {
    return response.status(400).json({
      error: `username is required and must be at least ${USERNAME_MIN_LENGTH} characters long`,
    });
  }

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return response.status(400).json({
      error: `password is required and must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    });
  }


  const existing = await User.findOne({ username })
  if(existing){
    return response.status(400).json({error: 'username is not available'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter