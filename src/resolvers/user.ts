import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from "graphql-resolvers";

import { User } from "../models";
import { Context } from "../types/types";
import { isAdmin, isAuthenticated } from "./authorization";
import { MessageRepository, UserRepository } from "../repository";

const userRepository = new UserRepository();
const messageRepository = new MessageRepository();

const createToken = async (user: User, secret: string, expiresIn: string) => {
  const { id, email, username, role } = user;
  const token = jwt.sign({ id, email, username, role }, secret, {expiresIn});
  return token;
};

export default {
  Query: {
    users: async (_: User, __: {}, ___: Context) => {
      return await userRepository.getAll();
    },
    user: async (_: User, {id}: {id: number}, {models}: Context) => {
      return await userRepository.get(id);
    },
    me: combineResolvers(
      isAuthenticated,
      async (_: User, __: {}, {me, loaders}: Context) => {
        return await loaders.userLoader.load(me.id);
      }
    )
  },

  Mutation: {
    signUp: async (
      _: User,
      { username, email, password }: {username: string, email: string, password: string},
      { secret }: Context
    ) => {
      const newUser = new User();
      newUser.username = username;
      newUser.email = email;
      newUser.password = password;

      const user: User = await userRepository.save(newUser);

      return {token: createToken(user, secret, '30m')};
    },
    signIn: async (
      _: User,
      { login, password }: {login: string, password: string},
      { secret }: Context
    ) => {
      const user = await userRepository.getByLogin(login);

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
      async (_, {id}: {id: number}, __: Context) => {
        return !!await userRepository.delete(id);
      }
    )
  },

  User: {
    messages: async (user: User, _: {}, __: Context) => {
      return messageRepository.getByUserId(user.id);
    }
  }
}