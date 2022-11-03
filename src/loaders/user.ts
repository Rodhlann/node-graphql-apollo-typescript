import { UserRepository } from '../repository';

const userRepository = new UserRepository();

const getUsers = async (ids: readonly number[]) => {
  return await userRepository.getAllByIds(ids.concat());
}

export { getUsers };
