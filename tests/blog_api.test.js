const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)
const Blog = require('../models/blog')
const {User} = require('../models/user')



beforeAll(async () => {
    await User.deleteMany({})
    const user = {
        username: 'test',
        name: 'test user',
        password: 'password'
    }

    await api
        .post('/api/users')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /application\/json/)
})

  beforeEach(async () => {
    await Blog.deleteMany({})

    await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some existing blogs', () => {
    test('blogs are returned as json', async  () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('a specific blog is within the returned notes', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(r => r.title)
        expect(titles).toContain('React patterns')
    })
})

describe('unique identifier named id', () => {
    test('of identifier called id', async () => {
        const result = await api.get('/api/blogs')
        
        expect(result.body[0].id).toBeDefined()
        expect(result.body[0]._id).toBe(undefined)
    })
})

describe('adding a new blog', () => {
    test('of adding a valid blog', async () => {
        const loginUser = {
            username: 'test',
            password: 'password'
        }

        const loggedUser = await api
            .post('/api/login')
            .send(loginUser)
            .expect('Content-Type', /application\/json/)

        const newBlog = {
            title: 'stoni tenis',
            author: 'Jan Ove Valdner',
            url: 'https://fulstackopen.com',
            likes: 55
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${loggedUser.body.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await helper.blogsInDb()
        

        const titles = blogsAtEnd.map(t => t.title)

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        expect(titles).toContain('stoni tenis')
    })

    test('of if likes prop is missing then it defaults to 0', async () => {
        const loginUser = {
            username: "test",
            password: "password",
          };
      
          const loggedUser = await api
            .post("/api/login")
            .send(loginUser)
            .expect("Content-Type", /application\/json/);

        const newBlog = {
            title: "Test an app",
            author: "Jhon Doe",
            url: "https://fullstackopen.com/",
        }

        const response =  await api
            .post('/api/blogs')
            .send(newBlog)
            .set("Authorization", `bearer ${loggedUser.body.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body.likes).toBeDefined()
        expect(response.body.likes).toBe(0)
    })

    test('blog without url is not added', async () => {
        const loginUser = {
            username: "test",
            password: "password",
          };
      
          const loggedUser = await api
            .post("/api/login")
            .send(loginUser)
            .expect("Content-Type", /application\/json/);

        const newBlog = {
            title: 'Test an app',
            author: 'Greg Lim'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${loggedUser.body.token}`)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await api.get('/api/blogs')
        expect(blogsAtEnd.body).toHaveLength(helper.initialBlogs.length)
    })

    test('fails with status 401 if not authenticated', async () => {
        const want = {
          title: 'Why Most Unit Testing is Waste',
          author: 'James O Coplien',
          url: 'https://rbcs-us.com/documents/Why-Most-Unit-Testing-is-Waste.pdf',
        };
  
        let response = await api.post('/api/blogs').send(want).expect(401).expect('Content-Type', /application\/json/);
  
        expect(response.body.error).toContain('authentication required to access this resource');
      });
  
})

describe('deletion of a blog', () => {
    test('succeeds with status 204 if  id is valid', async () => {
        const loginUser = {
            username: "test",
            password: "password",
          };
      
          const loggedUser = await api
            .post("/api/login")
            .send(loginUser)
            .expect("Content-Type", /application\/json/);

        const newBlog = {
                title: 'stoni tenis',
                author: 'Jan Ove Valdner',
                url: 'https://fulstackopen.com',
                likes: 55
        }
    
        await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
        const blogsGot = await helper.blogsInDb()
        
        
        
        
        const blogToDelete = blogsGot[2]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", `bearer ${loggedUser.body.token}`)
            .expect(204)
        
        const blogsAtEnd = await api.get('/api/blogs')

        expect(blogsAtEnd.body).toHaveLength(helper.initialBlogs.length)
    })
})

describe('updating of a blog', () => {
    test('succeeds with status 200 if data is ok', async () => {
        const loginUser = {
            username: "test",
            password: "password",
          };
      
        const loggedUser = await api
            .post("/api/login")
            .send(loginUser)
            .expect("Content-Type", /application\/json/);

        const newBlog = {
                title: 'stoni tenis',
                author: 'Jan Ove Valdner',
                url: 'https://fulstackopen.com',
                likes: 55
        }
    
        await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `Bearer ${loggedUser.body.token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
        const blogsGot = await helper.blogsInDb()      
        const blogToUpdate = blogsGot[2]
        
        
        const newBlogUpdated = {
            title: blogToUpdate.title, 
            author: blogToUpdate.author,
            url: blogToUpdate.url,
            likes: blogToUpdate.likes + 1,
        }
        
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(newBlogUpdated)
            .set('Authorization', `Bearer ${loggedUser.body.token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const response = await api.get(`/api/blogs/${blogToUpdate.id}`).expect(200)
        expect(response.body).not.toBeNull()
        expect(response.body.likes).toBe(newBlogUpdated.likes)
        
    })
})
afterAll(async () => {
  await mongoose.connection.close()
})