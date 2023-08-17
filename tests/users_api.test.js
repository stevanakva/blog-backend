const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");
const {User} = require("../models/user");

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("password", 10);
    const user = new User({username: "root", passwordHash});

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "kayra",
      name: "Kayra Berk Tuncer",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    
    expect(result.body.error).toContain("username is not available");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

test('fails if  username is shorter than 3 characters', async () => {
  const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "rr",
      password: "password",
      name: "gla gkakgs"
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    
    expect(result.body.error).toContain("username is required and must be at least 3 characters long");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
})


test('fails when password is too short', async () => {
  const usersBefore = await helper.usersInDb();

  const want = {
    username: 'unidque',
    name: 'Foo Bar',
    password: 'fo',
  };

  const response = await api.post('/api/users').send(want).expect(400).expect('Content-Type', /application\/json/);

  expect(response.body.error).toContain('must be at least 3 characters long');

  const usersAfter = await helper.usersInDb()
  expect(usersAfter).toHaveLength(usersBefore.length);
});


afterAll(() => {
  mongoose.connection.close;
});