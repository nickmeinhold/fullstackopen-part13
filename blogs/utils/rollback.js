const { Umzug, SequelizeStorage } = require("umzug");
const { sequelize } = require("./db");

const migrator = new Umzug({
  migrations: {
    glob: "migrations/*.js",
  },
  storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
  context: sequelize.getQueryInterface(),
  logger: console,
});

const rollbackMigration = async () => {
  await sequelize.authenticate();
  await migrator.down();
  await sequelize.close();
};

rollbackMigration();
console.log("Rolled back the last migration");
