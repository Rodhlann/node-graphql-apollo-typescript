import { ForbiddenError } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";
import { User } from "../models";
import { MessageRepository, UserRepository } from "../repository";
import { Context } from "../types/types";

export const isAuthenticated = async (_: User, __: {}, {me}: Context) => {
  if (!me || !await UserRepository.findOneBy({id: me.id})) {
    return new ForbiddenError('No authenticated user.');
  }
  return skip;
}

export const isMessageOwner = async (_: User, {id}: {id: number}, {me}: Context) => {
  const message = await MessageRepository.findOne({
    relations: ['user'],
    where: {id}
  });

  if (message?.user.id !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  (_, __, { me: { role }}) => 
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin.')
);