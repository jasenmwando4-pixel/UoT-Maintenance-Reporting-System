const bcrypt = require("bcrypt");
const { Client } = require("pg");

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const client = new Client({
    user: "postgres",
    password: "admin123", // your DB password
    database: "school_activity",
    host: "localhost",
    port: 5432,
  });

  await client.connect();

  await client.query(
    "INSERT INTO users(name, email, password, role) VALUES ($1,$2,$3,$4)",
    ["Admin User", "admin@gmail.com", hashedPassword, "admin"]
  );

  console.log("Admin created successfully");

  await client.end();
}

createAdmin();
