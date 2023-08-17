const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://stevanakvadrat:${password}@cluster0.e1ajbev.mongodb.net/testBlogApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
    title: String,
   author: String,
   url: String,
   likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
    title: 'Vesti sa rts',
    author: 'novinar A',
    url:'https://www.rts.rs',    
    likes: 10 
})

blog.save().then(() => {
    console.log('blog saved!')
    mongoose.connection.close()
})

const blog1 = new Blog({
    title: 'Vesti sa b92',
    author: 'novinar B',
    url:'https://www.b02.net',    
    likes: 5 
})

blog1.save().then(() => {
    console.log('blog saved!')
    mongoose.connection.close()
})

// Note.find({}).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })
