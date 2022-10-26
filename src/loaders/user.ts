import { In } from 'typeorm';
import models from '../models';
import { UserRepository } from '../repository';

const userRepository = new UserRepository();

export const batchUsers = async (ids: number[], model: typeof models) => {
  const users = await userRepository.getAllByIds(ids);

  return ids.map(id => users.find(user => user.id === id));
};