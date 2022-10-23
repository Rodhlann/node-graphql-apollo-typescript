import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorization';
import { Message } from '../models';
import { Context } from '../types/types';
import { MessageRepository } from '../repository';
import { LessThan } from 'typeorm';

const toCursorHash = (string: string) => Buffer.from(string).toString('base64');
const fromCursorHash = (string: string) => Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (
      _: Message, 
      { cursor, limit = 100 }: {cursor: string, limit: number}, 
      __: Context
    ) => {
      const cursorOptions = cursor ? 
      {
        where : {
          createdAt: LessThan(new Date(fromCursorHash(cursor)))
        }
      } : {};

      const messages = await MessageRepository.find({
        relations: ['user'],
        order: {
          createdAt: 'DESC'
        },
        take: limit + 1,
        ...cursorOptions
      });

      const hasNextPage = messages.length > limit;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString()),
          hasNextPage
        }
      };
    },
    message: async (_: Message, {id}: {id: number}, __: Context) => {
      return await MessageRepository.findOneBy({id});
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (_, {text}: {text: string}, {me}) => {
        return await MessageRepository.save({
          relations: ['user'],
          text,
          user: me
        });
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (_, {id}: {id: number}, __) => {
        return !!await MessageRepository.delete({id});
      }
    ),
    updateMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (_, {id, text}: {id: number, text: string}, __) => {
        MessageRepository.update(id, {text});
        return MessageRepository.findOneBy({id});
      }
    )
  },

  Message: {
    user: async (message: Message, _: {}, { loaders }: Context) => {
      const id = message.user.id?.toString();
      if (!id) {
        throw new Error("Malformed message data. Missing associated User ID.");
      }
      return await loaders.user.load(id.toString());
    }
  }
}