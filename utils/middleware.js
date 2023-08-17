const logger = require('./logger')
const jwt = require('jsonwebtoken')
const {User} = require('../models/user')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

const tokenExtractor =(req) => {
    const auth = req.get('authorization');
  if (auth?.toLowerCase().startsWith('bearer ')) {
    return auth.substring(7);
  }
  return null;

};

const userExtractor = async (request, response, next) => {
    request.user = null
    const token = tokenExtractor(request)
    if(token){
        const decoded = jwt.verify(token, process.env.SECRET)
        if(!decoded.id){
           return response.status(401).json({error: 'invalid or missing authentication token'})
        }

        const user = await User.findById(decoded.id)
        if(!user){
           return response.status(401).json({error: 'invalid or missing authentication token'})
        }

        request.user = user
    }

    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    userExtractor
}