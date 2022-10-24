import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from 'apollo-server';
import { combineResolvers } from "graphql-resolvers";

import { User } from "../models";
import { Context } from "../types/types";
import { isAdmin, isAuthenticated } from "./authorization";
import { MessageRepository, UserRepository } from "../repository";

const createToken = async (user: User, secret: string, expiresIn: string) => {
  const { id, email, username, role } = user;
  const token = jwt.sign({ id, email, username, role }, secret, {expiresIn});
  return token;
};

export default {
  Query: {
    users: async (_: User, __: {}, ___: Context) => {
      return await UserRepository.find();
    },
    user: async (_: User, {id}: {id: number}, {models}: Context) => {
      return await UserRepository.findOneBy({id});
    },
    me: combineResolvers(
      isAuthenticated,
      async (_: User, __: {}, {me}: Context) => {
        return await UserRepository.findOneBy({ id: me.id });
      }
    )
  },

  Mutation: {
    signUp: async (
      _: User,
      { username, email, password }: {username: string, email: string, password: string},
      { secret }: Context
    ) => {
      const newUser = UserRepository.create({
        username,
        email,
        password
      });

      const user: User = await UserRepository.save(newUser);

      return {token: createToken(user, secret, '30m')};
    },
    signIn: async (
      _: User,
      { login, password }: {login: string, password: string},
      { secret }: Context
    ) => {
      const user = await UserRepository.findByLogin(login);

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
        return !!await UserRepository.delete({id});
      }
    )
  },

  User: {
    messages: async (user: User, _: {}, __: Context) => {
      return MessageRepository.find({
        relations: ['user'],
        where: {
          user: {
            id: user.id
          }
        }
      });
    }
  }
}