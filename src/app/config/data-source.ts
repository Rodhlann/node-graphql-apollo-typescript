import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { User, Message } from "../models";

export const MySqlDataSource = new DataSource({
  socketPath:"/tmp/mysql.sock",
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.TEST_DATABASE || process.env.DATABASE,
  synchronize: true,
  logging: true,
  entities: [User, Message],
  subscribers: [],
  migrations: []
});