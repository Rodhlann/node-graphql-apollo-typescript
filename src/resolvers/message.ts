import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorization';
import { Op } from 'sequelize';
import { Message } from '../models';
import { Context } from '../types/types';

const toCursorHash = (string: string) => Buffer.from(string).toString('base64');
const fromCursorHash = (string: string) => Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (
      parent: Message, 
      { cursor, limit = 100 }: {cursor: string, limit: number}, 
      { models }: Context
    ) => {
      const cursorOptions = cursor ? 
      {
        where : {
          createdAt: {
            [Op.lt]: fromCursorHash(cursor)
          }
        }
      } : {};

      const messages = await models.Message.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          endCursor: toCursorHash(edges[edges.length - 1].createdAt),
          hasNextPage
        }
      };
    },
    message: async (parent: Message, {id}: {id: number}, {models}: Context) => {
      return await models.Message.findByPk(id);
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, {text}: {text: string}, {me, models}) => {
        return await models.Message.create({
          text,
          userId: me.id
        });
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, {id}, {models}) => {
        return await models.Message.destroy({ where: {id}});
      }
    ),
    updateMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, {id, text}: {id: number, text: string}, {models}) => {
        return await models.Message.update({text}, {where: {id}});
      }
    )
  },

  Message: {
    user: async (message: Message, args: {}, { loaders }: Context) => {
      return await loaders.user.load(message.user.id);
    }
  }
}