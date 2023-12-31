const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const {User} = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})  
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if(blog){
    response.json(blog)
  }  else {
    response.status(404).end()
  }
})
  
blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const user = request.user
  if(!user){
    return response.status(401).json({ error: 'authentication required to access this resource' });
  }
  
  const blog = {
    title : body.title,
    author : body.author,
    url : body.url,
    likes: body.likes,    
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
  response.json(updatedBlog)
   
})



blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = request.user
    if(!user){
      return response.status(401).json({ error: 'authentication required to access this resource' });
    }
    
    if (!body.title || !body.url)
    return response.status(400).json({error: "title or url is missing"});

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user.id
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

  blogsRouter.delete('/:id', async (request, response) => {
    const user = request.user
    

    const blog = await Blog.findById(request.params.id)
    if(blog && blog.user.toString() === user.id){
      await Blog.findByIdAndRemove(request.params.id)
      return response.status(204).end()
    }

    return response.status(401).json({
      error: 'Unauthorized to access the blog'
    })

    
    
  })

  module.exports = blogsRouter