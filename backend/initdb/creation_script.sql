CREATE TABLE IF NOT EXISTS "User" (
  "userId" serial PRIMARY KEY,
  "firstname" varchar(255),
  "lastname" varchar(255),
  "mail" varchar(255) UNIQUE,
  "password" varchar(255),
  "phoneNumber" varchar(255)
);