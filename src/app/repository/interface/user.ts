import { User } from "../../models";

export default interface IUserRepository {
  getAll(): Promise<User[]>;
  getAllByIds(ids: number[]): Promise<User[]>;
  get(id: number): Promise<User>;
  getByLogin(login: string): Promise<User>;
  save(entity: User): Promise<User>;
  delete(id: number): Promise<Boolean>;
}