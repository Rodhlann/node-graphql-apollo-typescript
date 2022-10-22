import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import User from './user';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
  })
  text!: string;

  // @BelongsTo(() => User, { foreignKey: 'user_id' })
  // user!: User;
}
