import { UserInputError } from "apollo-server";
import { LessThan } from "typeorm";
import { MySqlDataSource } from "../config/data-source";
import { Message, User } from "../models";
import IMessageRepository from "./interface/message";

export default class MessageRepository implements IMessageRepository {

  private repository = MySqlDataSource.getRepository(Message);

  async getAll(): Promise<Message[]> {
    return await this.repository.find({
      relations: ['user']
    });
  }

  async getPaginated(cursor: string | undefined, limit: number): Promise<Message[]> {
    const cursorOptions = cursor ? 
    { where : {createdAt: LessThan(new Date(cursor))} } : 
    {};

    return await this.repository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC'
      },
      take: limit + 1,
      ...cursorOptions
    });
  }

  async get(id: number): Promise<Message> {
    const message = await this.repository.findOne({
      relations: ['user'],
      where: {id}
    });

    if (!!message) {
      return message;
    }
    
    throw new UserInputError("Message not found with ID: " + id); 
  }

  async getByUserId(id: number): Promise<Message[]> {
    return await this.repository.find({
      relations: ['user'],
      where: {
        user: {id}
      }
    });
  }

  async delete(id: number): Promise<Boolean> {
    return !!this.repository.delete({id});
  }

  async save(text: string, user: User): Promise<Message> {
    return await this.repository.save({
      relations: ['user'],
      text,
      user
    });
  }

  async update(id: number, text: string): Promise<Message> {
    await this.repository.update(id, {text});
    return await this.get(id);
  }
}
