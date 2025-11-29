const jwt = require('jsonwebtoken');
const { Blog, User } = require('../models');
const { SECRET } = require('../utils/config');

const initialBlogs = [
  {
    author: 'John Doe',
    title: 'First blog post about React',
    url: 'http://example.com/1',
    likes: 5
  },
  {
    author: 'Jane Smith',
    title: 'Learning Node.js and Express',
    url: 'http://example.com/2',
    likes: 10
  },
  {
    author: 'John Doe',
    title: 'Advanced React patterns',
    url: 'http://example.com/3',
    likes: 15
  },
  {
    author: 'Bob Johnson',
    title: 'Database design principles',
    url: 'http://example.com/4',
    likes: 8
  }
];

const initialUsers = [
  {
    username: 'john@example.com',
    name: 'John Doe'
  },
  {
    username: 'jane@example.com',
    name: 'Jane Smith'
  }
];

const blogsInDb = async () => {
  const blogs = await Blog.findAll();
  return blogs.map(blog => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.findAll();
  return users.map(user => user.toJSON());
};

const resetDatabase = async () => {
  await Blog.destroy({ where: {} });
  await User.destroy({ where: {} });
};

const createTestUser = async (userData = initialUsers[0]) => {
  const user = await User.create(userData);
  return user;
};

const getTokenForUser = (user) => {
  const userForToken = {
    username: user.username,
    id: user.id
  };
  return jwt.sign(userForToken, SECRET);
};

const createBlogsWithUser = async (user) => {
  const blogs = await Promise.all(
    initialBlogs.map(blog =>
      Blog.create({ ...blog, userId: user.id })
    )
  );
  return blogs;
};

module.exports = {
  initialBlogs,
  initialUsers,
  blogsInDb,
  usersInDb,
  resetDatabase,
  createTestUser,
  getTokenForUser,
  createBlogsWithUser
};
