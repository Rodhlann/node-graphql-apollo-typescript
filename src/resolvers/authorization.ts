import { ForbiddenError } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";
import { User } from "../models";
import { Context } from "../types/types";

export const isAuthenticated = (parent: User, args: {}, {me}: Context) => 
  me ? skip : new ForbiddenError('No authenticated user.');

export const isMessageOwner = async (parent: User, {id}: {id: number}, {models, me}: Context) => {
  const message = await models.Message.findByPk(id, { raw: true });

  if (message?.user.id !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role }}) => 
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin.')
);