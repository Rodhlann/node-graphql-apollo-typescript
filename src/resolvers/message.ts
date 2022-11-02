import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorization';
import { Message } from '../models';
import { Context } from '../types/types';
import { MessageRepository, UserRepository } from '../repository';

const messageRepository = new MessageRepository();

const toCursorHash = (string: string) => Buffer.from(string).toString('base64');
const fromCursorHash = (string: string) => Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    messages: async (
      _: Message, 
      { cursor, limit = 100 }: {cursor: string, limit: number}, 
      __: Context
    ) => {
      const readableCursor = cursor && fromCursorHash(cursor);
      const messages = await messageRepository.getPaginated(readableCursor, limit);

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
      return await messageRepository.get(id);
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (_, {text}: {text: string}, {me}) => {
        return await messageRepository.save(text, me);
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (_, {id}: {id: number}, __) => {
        return await messageRepository.delete(id);
      }
    ),
    updateMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (_, {id, text}: {id: number, text: string}, __) => {
        return await messageRepository.update(id, text);
      }
    )
  },

  Message: {
    user: async (message: Message, _: {}, { loaders }: Context) => {
      const id = message.user.id?.toString();
      if (!id) {
        throw new Error("Malformed message data. Missing associated User ID.");
      }
      return await new UserRepository().get(message.user.id);
    }
  }
}