const Blog = require("./blog");
const User = require("./user");
const ReadingList = require("./reading_list");

// User creates blogs
User.hasMany(Blog);
Blog.belongsTo(User, { as: "User" });

// Many-to-many: Users can add blogs to their reading list
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' });
Blog.belongsToMany(User, { through: ReadingList, as: 'users_marked' });

module.exports = {
  Blog,
  User,
  ReadingList,
};
