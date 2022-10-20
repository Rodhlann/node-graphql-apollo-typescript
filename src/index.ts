import { ApolloServer } from "apollo-server-express";
import { Sequelize } from "sequelize-typescript";
import models, { User, Message } from "./models";
import loaders from './loaders';
import schema from './schema';
import resolvers from './resolvers';
import express, { Request } from "express";
import jwt, { Secret } from 'jsonwebtoken';
import { CustomRequest } from "./types/types";
import { AuthenticationError } from "apollo-server";
import DataLoader from "dataloader";
import cors from "cors";

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

const sequelize = new Sequelize({
  database: process.env.TEST_DATABASE || process.env.DATABASE,
  dialect: 'postgres',
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  models: [User, Message]
});

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
      loaders: {
        user: new DataLoader((keys: readonly string[]) =>
          loaders.user.batchUsers(keys.concat(), models))
      }
    };
  }
});

sequelize.sync({force: isTest}).then(async () => {
  if (isTest) {
    await createUserWithMessages(new Date());
  }

  server.start().then(() => {
    server.applyMiddleware({ app, path: '/graphql' });
    app.listen({ port: 8000 }, () => {
      console.log('Apollo server on http://localhost:8000/graphql');
    });
  });
});

const createUserWithMessages = async (date: Date) => {
  await User.create(
    {
      username: 'rodhlann',
      password: 'pass123',
      email: 'rodhlann@gmail.com',
      role: 'ADMIN',
      messages: [
        {
          text: 'wow this is a cool message!',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        }
      ]
    },
    {
      include: [Message]
    }
  );

  await User.create(
    {
      username: 'someotherguy',
      password: 'word456',
      email: 'someotherguy@gmail.com',
      messages: [
        {
          text: 'this is a less cool message...',
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          text: 'whazzzaaaaaaaah',
          createdAt: date.setSeconds(date.getSeconds() + 1)
        }
      ]
    },
    {
      include: [Message]
    }
  );
};