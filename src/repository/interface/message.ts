import { Message, User } from "../../models";

export default interface IMessageRepository {
  getAll(): Promise<Message[]>;
  getPaginated(cursor: string, limit: number): Promise<Message[]>;
  get(id: number): Promise<Message>;
  delete(id: number): Promise<Boolean>;
  save(text: string, user: User): Promise<Message>;
  update(id: number, text: string): Promise<Message>;
}