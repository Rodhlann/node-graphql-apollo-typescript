import { Sequelize } from "sequelize-typescript";
import { User, Message } from "./model";

const isTest = !!process.env.TEST_DATABASE;

const sequelize = new Sequelize({
  database: process.env.TEST_DATABASE || process.env.DATABASE,
  dialect: 'postgres',
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  models: [User, Message]
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