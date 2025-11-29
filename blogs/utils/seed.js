const { Blog, User } = require('../models');
const { connectToDatabase, sequelize } = require('./db');

const seedData = async () => {
  await connectToDatabase();

  // Clear existing data
  await Blog.destroy({ where: {} });
  await User.destroy({ where: {} });

  // Create users
  const dan = await User.create({
    username: 'dan@overreacted.io',
    name: 'Dan Abramov'
  });

  const martin = await User.create({
    username: 'martin@martinfowler.com',
    name: 'Martin Fowler'
  });

  const kent = await User.create({
    username: 'kent@kentcdodds.com',
    name: 'Kent C. Dodds'
  });

  // Create blogs
  await Blog.create({
    author: 'Dan Abramov',
    url: 'https://overreacted.io/goodbye-clean-code/',
    title: 'Goodbye, Clean Code',
    likes: 10,
    userId: dan.id
  });

  await Blog.create({
    author: 'Martin Fowler',
    url: 'https://martinfowler.com/articles/is-quality-worth-cost.html',
    title: 'Is High Quality Software Worth the Cost?',
    likes: 5,
    userId: martin.id
  });

  await Blog.create({
    author: 'Dan Abramov',
    url: 'https://overreacted.io/a-complete-guide-to-useeffect/',
    title: 'A Complete Guide to useEffect',
    likes: 15,
    userId: dan.id
  });

  await Blog.create({
    author: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog/application-state-management-with-react',
    title: 'Application State Management with React',
    likes: 8,
    userId: kent.id
  });

  await Blog.create({
    author: 'Martin Fowler',
    url: 'https://martinfowler.com/bliki/TechnicalDebt.html',
    title: 'Technical Debt',
    likes: 12,
    userId: martin.id
  });

  console.log('✓ Database seeded successfully');
  console.log(`✓ Created ${await User.count()} users`);
  console.log(`✓ Created ${await Blog.count()} blogs`);

  await sequelize.close();
};

seedData().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
