import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from "graphql-resolvers";

import { User } from "../models";
import { Context } from "../types/types";
import { isAdmin } from "./authorization";

const createToken = async (user: User, secret: string, expiresIn: string) => {
  const { id, email, username, role } = user;
  const token = jwt.sign({ id, email, username, role }, secret, {expiresIn});
  return token;
};

export default {
  Query: {
    users: async (parent: User, args: {}, {models}: Context) => {
      return await models.User.findAll();
    },
    user: async (parent: User, {id}: {id: string}, {models}: Context) => {
      return await models.User.findByPk(id);
    },
    me: async (parent: User, args: {}, {models, me}: Context) => {
      if (!me) {
        return null;
      }

      return await models.User.findByPk(me.id);
    }
  },

  Mutation: {
    signUp: async (
      parent: User,
      { username, email, password }: {username: string, email: string, password: string},
      { models, secret }: Context
    ) => {
      const user: User = await models.User.create({
        username,
        email,
        password
      });

      return {token: createToken(user, secret, '30m')};
    },
    signIn: async (
      parent: User,
      { login, password }: {login: string, password: string},
      { models, secret }: Context
    ) => {
      const user = await models.User.findByLogin(login);

      if (!user) {
        throw new UserInputError('No user found with this login.');
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user, secret, '30m') };
    },
    deleteUser: combineResolvers(
      isAdmin,
      async (parent, {id}: {id: number}, {models}: Context) => {
        return await models.User.destroy({
          where: { id }
        });
      }
    )
  },

  User: {
    messages: async (user: User, args: {}, {models}: Context) => {
      return await models.Message.findAll({
        where: {
          userId: user.id
        }
      });
    }
  }
}