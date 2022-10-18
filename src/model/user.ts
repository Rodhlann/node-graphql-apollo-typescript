import { Table, Column, Model, HasMany } from "sequelize-typescript";
import Message from "./message";

@Table
export default class User extends Model {
  @Column
  username!: string;

  @Column
  email!: string;

  @Column
  password!: string;

  @Column
  role!: Role;

  @HasMany(() => Message)
  messages!: Message[]
}

enum Role {
  ADMIN = 'ADMIN'
}