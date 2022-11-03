import { UserRepository } from '../repository';

const userRepository = new UserRepository();

const getUserLoader = async (ids: readonly number[]) => {
  return await userRepository.getAllByIds(ids.concat());
}

export { getUserLoader };
