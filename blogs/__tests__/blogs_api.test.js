const supertest = require('supertest');
const express = require('express');
const { sequelize } = require('../utils/db');
const blogsRouter = require('../controllers/blogs');
const { Blog, User, syncModels } = require('../models');
const helper = require('./test_helper');

const app = express();
app.use(express.json());
app.use('/api/blogs', blogsRouter);

const api = supertest(app);

beforeAll(async () => {
  await syncModels();
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await helper.resetDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/blogs', () => {
  beforeEach(async () => {
    const user = await helper.createTestUser();
    await helper.createBlogsWithUser(user);
  });

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('blogs are ordered by likes in descending order', async () => {
    const response = await api.get('/api/blogs');
    const likes = response.body.map(blog => blog.likes);

    for (let i = 0; i < likes.length - 1; i++) {
      expect(likes[i]).toBeGreaterThanOrEqual(likes[i + 1]);
    }
  });

  test('blogs include user information', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].User).toBeDefined();
    expect(response.body[0].User.name).toBeDefined();
  });

  test('blogs do not include userId field', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body[0].userId).toBeUndefined();
  });

  describe('search functionality', () => {
    test('returns blogs with search string in title', async () => {
      const response = await api
        .get('/api/blogs?search=React')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(blog =>
        blog.title.includes('React')
      )).toBe(true);
    });

    test('returns blogs with search string in author', async () => {
      const response = await api
        .get('/api/blogs?search=John')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.every(blog =>
        blog.author.toLowerCase().includes('john')
      )).toBe(true);
    });

    test('returns blogs with search string in either title or author', async () => {
      const response = await api
        .get('/api/blogs?search=Node')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toContain('Node');
    });

    test('search is case-insensitive', async () => {
      const response = await api
        .get('/api/blogs?search=react')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });

    test('returns empty array when no blogs match search', async () => {
      const response = await api
        .get('/api/blogs?search=NonExistent')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    test('returns all blogs when search parameter is empty', async () => {
      const response = await api
        .get('/api/blogs?search=')
        .expect(200);

      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });
  });
});

describe('POST /api/blogs', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await helper.createTestUser();
    token = helper.getTokenForUser(user);
  });

  test('a valid blog can be added with valid token', async () => {
    const newBlog = {
      author: 'Test Author',
      title: 'Test Blog',
      url: 'http://test.com',
      likes: 5
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(1);

    const addedBlog = blogsAtEnd[0];
    expect(addedBlog.title).toBe(newBlog.title);
    expect(addedBlog.author).toBe(newBlog.author);
    expect(addedBlog.url).toBe(newBlog.url);
    expect(addedBlog.userId).toBe(user.id);
  });

  test('likes defaults to 0 if not provided', async () => {
    const newBlog = {
      author: 'Test Author',
      title: 'Test Blog',
      url: 'http://test.com'
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(200);

    expect(response.body.likes).toBe(0);
  });

  test('fails with status 401 if token is missing', async () => {
    const newBlog = {
      author: 'Test Author',
      title: 'Test Blog',
      url: 'http://test.com'
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);
  });

  test('fails with status 401 if token is invalid', async () => {
    const newBlog = {
      author: 'Test Author',
      title: 'Test Blog',
      url: 'http://test.com'
    };

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer invalid_token')
      .send(newBlog)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);
  });

  test('fails with status 400 if title is missing', async () => {
    const newBlog = {
      author: 'Test Author',
      url: 'http://test.com'
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);
  });

  test('fails with status 400 if url is missing', async () => {
    const newBlog = {
      author: 'Test Author',
      title: 'Test Blog'
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(0);
  });
});

describe('GET /api/blogs/:id', () => {
  let user;
  let blog;

  beforeEach(async () => {
    user = await helper.createTestUser();
    const blogs = await helper.createBlogsWithUser(user);
    blog = blogs[0];
  });

  test('succeeds with valid id', async () => {
    const response = await api
      .get(`/api/blogs/${blog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.id).toBe(blog.id);
    expect(response.body.title).toBe(blog.title);
  });

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistentId = 99999;

    await api
      .get(`/api/blogs/${nonExistentId}`)
      .expect(404);
  });

  test('fails with status 400 if id is invalid', async () => {
    await api
      .get('/api/blogs/invalid')
      .expect(400);
  });
});

describe('PUT /api/blogs/:id', () => {
  let user;
  let blog;

  beforeEach(async () => {
    user = await helper.createTestUser();
    const blogs = await helper.createBlogsWithUser(user);
    blog = blogs[0];
  });

  test('succeeds with valid data', async () => {
    const updatedData = {
      likes: blog.likes + 10
    };

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(response.body.likes).toBe(blog.likes + 10);
    expect(response.body.id).toBe(blog.id);
  });

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistentId = 99999;

    await api
      .put(`/api/blogs/${nonExistentId}`)
      .send({ likes: 100 })
      .expect(404);
  });

  test('updates only likes field', async () => {
    const originalTitle = blog.title;

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send({ likes: 999, title: 'Should not change' })
      .expect(200);

    expect(response.body.likes).toBe(999);
    expect(response.body.title).toBe(originalTitle);
  });
});

describe('DELETE /api/blogs/:id', () => {
  let user;
  let blog;
  let token;

  beforeEach(async () => {
    user = await helper.createTestUser();
    token = helper.getTokenForUser(user);
    const blogs = await helper.createBlogsWithUser(user);
    blog = blogs[0];
  });

  test('succeeds with status 204 if blog exists and user is creator', async () => {
    const blogsAtStart = await helper.blogsInDb();

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map(b => b.title);
    expect(titles).not.toContain(blog.title);
  });

  test('fails with status 401 if token is missing', async () => {
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('fails with status 403 if user is not the creator', async () => {
    const anotherUser = await User.create({
      username: 'another@example.com',
      name: 'Another User'
    });
    const anotherToken = helper.getTokenForUser(anotherUser);

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .expect(403);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('fails with status 404 if blog does not exist', async () => {
    const nonExistentId = 99999;

    await api
      .delete(`/api/blogs/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
