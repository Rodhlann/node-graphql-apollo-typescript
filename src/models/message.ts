import { Table, Column, Model, PrimaryKey, BelongsTo, Validate } from 'sequelize-typescript';
import User from './user';

@Table
export default class Message extends Model {
  // @Column
  // @PrimaryKey
  // id!: number;

  @Validate({
    notEmpty: {
      msg: 'Message text cannot be empty!'
    }
  })
  @Column
  text!: string;

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user!: User;
}
