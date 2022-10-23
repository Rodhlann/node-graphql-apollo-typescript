import { In } from 'typeorm';
import models from '../models';
import { UserRepository } from '../repository';

export const batchUsers = async (keys: string[], model: typeof models) => {
  const users = await UserRepository.find({
    where: {
      id: In(keys)
    },
  });

  return keys.map(key => users.find(user => user.id === Number(key)));
};