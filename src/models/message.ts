import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './index';

@Entity()
export default class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
  })
  text!: string;

  @ManyToOne(() => User, (user) => user.id, { 
    onDelete: 'CASCADE',
  })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date
}
