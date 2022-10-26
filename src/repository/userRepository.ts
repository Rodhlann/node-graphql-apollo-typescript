import { UserInputError } from "apollo-server";
import { In } from "typeorm";
import { MySqlDataSource } from "../config/data-source";
import { User } from "../models";
import IUserRepository from "./interface/user";

export default class UserRepository implements IUserRepository {
  private repository = MySqlDataSource.getRepository(User);

  async getAll(): Promise<User[]> {
    return await this.repository.find();
  }

  async getAllByIds(ids: number[]): Promise<User[]> {
    return await this.repository.find({
      where: {
        id: In(ids)
      },
    });
  }

  async get(id: number): Promise<User> {
    const user = await this.repository.findOne({
      // relations: ['message'],
      where: {id}
    });

    if (!!user) {
      return user;
    }

    throw new UserInputError("User not found with ID: " + id);
  }

  async getByLogin(login: string): Promise<User> {
    const user = await this.repository.createQueryBuilder("user")
      .where('user.username = :login', {login})
      .orWhere('user.email = :login', {login})
      .getOne();

    if (!!user) {
      return user;
    }

    throw new UserInputError("User not found with login: " + login);
  }

  async save(entity: User): Promise<User> {
    return await this.repository.save(entity);
  }

  async delete(id: number): Promise<Boolean> {
    return !!await this.repository.delete({id});
  }
}
