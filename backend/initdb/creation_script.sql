CREATE TABLE IF NOT EXISTS "User" (
  "userId" serial PRIMARY KEY,
  "firstname" varchar(255),
  "lastname" varchar(255),
  "mail" varchar(255) UNIQUE,
  "password" varchar(255),
  "phoneNumber" varchar(255)
);

CREATE TABLE IF NOT EXISTS "Category" (
  "categoryId" serial PRIMARY KEY,
  "categoryLabel" varchar(255),
  "userId" integer REFERENCES "User"("userId"),

  UNIQUE("categoryLabel", "userId")
);

CREATE TABLE IF NOT EXISTS "Transaction" (
  "transactionId" serial PRIMARY KEY,
  "userId" integer REFERENCES "User"("userId"),
  "categoryId" integer REFERENCES "Category"("categoryId"),
  "amount" decimal,
  "transactionDate" timestamp,
  "description" varchar(255)
);

CREATE TABLE IF NOT EXISTS "Budget" (
  "categoryId" integer REFERENCES "Category"("categoryId"),
  "month" integer,
  "year" integer,
  "userId" integer REFERENCES "User"("userId"),
  "amount" decimal,
  PRIMARY KEY ("categoryId", "month", "year", "userId")
);