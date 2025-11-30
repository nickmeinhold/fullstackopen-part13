# Blogs Application

A RESTful API for managing blog posts, users, and reading lists. Built with Node.js, Express, and PostgreSQL with Sequelize ORM.

## Features

- User authentication with JWT tokens
- Blog post management (CRUD operations)
- User reading lists with read/unread status tracking
- Author statistics
- Blog search functionality (by title or author)
- Session management
- Database migrations support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Install dependencies:

```bash
cd blogs
npm install
```

1. Set up environment variables:

Create a [.env](blogs/.env) file in the blogs directory with the following variables:

```env
DATABASE_URL=postgres://username:password@localhost:5432/fullstackopen
TEST_DATABASE_URL=postgres://username:password@localhost:5432/fullstackopen_test
SECRET=your-secret-key-here
PORT=3001
```

Replace `username` and `password` with your PostgreSQL credentials.

## Database Setup using Local PostgreSQL

Ensure PostgreSQL is installed and running locally, then create the required databases:

```bash
createdb fullstackopen
createdb fullstackopen_test
```

### Running Migrations

The application will automatically run migrations on startup. Migrations are located in the [migrations/](blogs/migrations/) directory.

To manually rollback the latest migration:

```bash
npm run migration:down
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on port 3001 (or the PORT specified in your .env file) and automatically restart when you make changes to the code.

### Production Mode

```bash
npm start
```

## Running Tests

The application uses Jest for testing with Supertest for API integration tests.

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Test Coverage

Tests cover the following areas:

- Blog CRUD operations
- User authentication and authorization
- Reading list management
- Search functionality
- Input validation
- Error handling

Test files are located in the [\_\_tests\_\_/](blogs/__tests__/) directory:

- [blogs_api.test.js](blogs/__tests__/blogs_api.test.js) - Main API tests
- [test_helper.js](blogs/__tests__/test_helper.js) - Test utilities and helpers

## API Endpoints

### Authentication

- `POST /api/login` - Login and receive JWT token
- `POST /api/logout` - Logout (invalidates session)

### Users

- `GET /api/users` - Get all users (includes reading lists)
- `POST /api/users` - Create a new user

### Blogs

- `GET /api/blogs` - Get all blogs (supports `?search=keyword` query parameter)
- `GET /api/blogs/:id` - Get a specific blog
- `POST /api/blogs` - Create a new blog (requires authentication)
- `PUT /api/blogs/:id` - Update blog likes
- `DELETE /api/blogs/:id` - Delete a blog (requires authentication and ownership)

### Authors

- `GET /api/authors` - Get author statistics (blog count and total likes)

### Reading Lists

- `POST /api/readinglists` - Add a blog to your reading list (requires authentication)
- `PUT /api/readinglists/:id` - Mark a blog as read/unread (requires authentication)

## Project Structure

```sh
blogs/
├── __tests__/           # Test files
├── controllers/         # Route handlers
│   ├── authors.js
│   ├── blogs.js
│   ├── login.js
│   ├── logout.js
│   ├── readinglists.js
│   └── users.js
├── middleware/          # Express middleware
│   └── errorHandler.js
├── migrations/          # Database migrations
├── models/              # Sequelize models
│   ├── blog.js
│   ├── user.js
│   ├── reading_list.js
│   ├── session.js
│   └── index.js
├── requests/            # Sample API requests (e.g., REST Client files)
├── utils/               # Utility functions
│   ├── config.js
│   ├── db.js
│   └── seed.js
├── .env                 # Environment variables
├── docker-compose.yml   # Docker Compose configuration
├── index.js             # Application entry point
└── package.json         # Dependencies and scripts
```

## Additional Scripts

### Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Login using `POST /api/login` with username and password
2. Include the returned token in subsequent requests using the `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```

## Database Models

- **User**: Stores user information (username, name)
- **Blog**: Stores blog posts (title, author, url, likes, year)
- **ReadingList**: Many-to-many relationship between users and blogs
- **Session**: Tracks active user sessions

## Error Handling

The application includes centralized error handling that returns appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Development

The application uses:

- **Express** for the web framework
- **Sequelize** as the ORM
- **PostgreSQL** for the database
- **JWT** for authentication
- **Umzug** for migrations
- **Jest** and **Supertest** for testing
