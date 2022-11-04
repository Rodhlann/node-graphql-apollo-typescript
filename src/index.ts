import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import jwt, { Secret } from 'jsonwebtoken';
import { CustomRequest } from "./app/types/types";
import { AuthenticationError } from "apollo-server";
import cors from "cors";
import { MySqlDataSource } from "./app/config/data-source";
import createLoaders from "./app/loaders";
import models, { User, Message } from "./app/models";
import { UserRole } from "./app/models/user";
import resolvers from "./app/resolvers";
import schema from "./app/schema";

const isTest = !!process.env.TEST_DATABASE;

const getMe = async (req: CustomRequest) => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      const user = jwt.verify(token, process.env.SECRET as Secret);
      return user;
    } catch (e) {
      throw new AuthenticationError('Your session has expired.');
    }
  }
}

const app = express();
app.use(cors());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message
    }
  },
  context: async ({req}) => {
    const me = await getMe(req);
    return {
      models,
      secret: process.env.SECRET,
      me,
      loaders: createLoaders()
    };
  },
});

MySqlDataSource.initialize().then(async () => {
  if (isTest) {
    await createUserWithMessages();
  }

  server.start().then(() => {
    server.applyMiddleware({ app, path: '/graphql' });
    app.listen({ port: 8000 }, () => {
      console.log('Apollo server on http://localhost:8000/graphql');
    });
  });
});

const createUserWithMessages = async () => {
  await MySqlDataSource.manager.delete(User, {});
  await MySqlDataSource.manager.delete(Message, {});

  const user1 = new User();
  user1.username = 'rodhlann';
  user1.email = 'rodhlann@gmail.com';
  user1.password = 'pass123';
  user1.role = UserRole.ADMIN;
  await MySqlDataSource.manager.save(user1);

  const message1 = new Message();
  message1.text = 'wow this is a cool message!';
  message1.user = user1;
  await MySqlDataSource.manager.save(message1);

  // wait for one second to provide unique timestamp cursor to entry
  await new Promise(r => setTimeout(r, 1000));

  const message3 = new Message();
  message3.text = 'wow this is a cool message again!';
  message3.user = user1;
  await MySqlDataSource.manager.save(message3);

  // wait for one second to provide unique timestamp cursor to entry
  await new Promise(r => setTimeout(r, 1000));

  const user2 = new User();
  user2.username = 'someotherguy';
  user2.email = 'someotherguy@gmail.com';
  user2.password = 'word456';
  await MySqlDataSource.manager.save(user2);

  const message2 = new Message();
  message2.text = 'this is a less cool message...';
  message2.user = user2;
  await MySqlDataSource.manager.save(message2);
};