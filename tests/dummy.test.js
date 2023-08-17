const dummy = require('../utils/list_helper').dummy


test('of dummy returns one', () => {
    const blogs = []

    const result = dummy(blogs)
    expect(result).toBe(1)
})