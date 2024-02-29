import mysql from "mysql";

const env = process.env.NODE_ENV || "development";

const databaseDetails = {
  // development: {
  //   host: '127.0.0.1',
  //   user: 'root',
  //   password: 'Bhavana@123',
  //   database: 'incubator_saas',
  //   port: 3306, // Default MySQL port
  // },
  development: {
    host: "35.154.239.8",
    user: "root",
    password: "incubator_saas",
    database: "incubator_saas",
    port: 3306, // Default MySQL port
  },
  //TODO :These needs to be updated
  production: {
    host: "localhost",
    user: "root",
    password: "Lavanya@123",
    database: "incubator_saas",
  },
  test: {
    host: "localhost",
    user: "root",
    password: "Lavanya@123",
    database: "incubator_saas",
  },
};

const config = databaseDetails[env];

export const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  port: config.port,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});
