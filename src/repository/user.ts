import { MySqlDataSource } from "../config/data-source";
import { User } from "../models";

const UserRepository = MySqlDataSource.getRepository(User).extend({
  async findByLogin(login: string) {
    return this.createQueryBuilder("user")
      .where('user.username = :login', {login})
      .orWhere('user.email = :login', {login})
      .getOne();
  },
});

export default UserRepository;
