import { Table, Column, Model, PrimaryKey, BelongsTo } from 'sequelize-typescript';
import User from './user';

@Table
export default class Message extends Model {
  @Column
  @PrimaryKey
  id!: number;

  @Column
  text!: string;

  @BelongsTo(() => User)
  user!: User;
}
