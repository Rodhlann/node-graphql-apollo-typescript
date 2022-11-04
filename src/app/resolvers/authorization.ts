import { ForbiddenError } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";
import { User } from "../models";
import { MessageRepository } from "../repository";
import { Context } from "../types/types";

const messageRepository = new MessageRepository();

export const isAuthenticated = async (_: User, __: {}, {me, loaders}: Context) => {
  if (!me || !await loaders.userLoader.load(me.id)) {
    return new ForbiddenError('No authenticated user.');
  }
  return skip;
}

export const isMessageOwner = async (_: User, {id}: {id: number}, {me}: Context) => {
  const message = await messageRepository.get(id);

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