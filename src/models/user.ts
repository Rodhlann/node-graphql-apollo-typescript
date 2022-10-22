import bcrypt from 'bcrypt';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import Message from "./message";

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
    unique: true
  })
  username!: string;

  @Column({
    nullable: false,
    unique: true
  })
  email!: string;

  @Column({
    nullable: false
  })
  password!: string;

  @Column({
    default: null
  })
  role!: UserRole;

  @OneToMany(() => Message, (message) => message.id, {
    cascade: true
  })
  messages!: Message[]

  @BeforeInsert()
  async encryptPassword() {
    this.password = await this.generatePasswordHash();
  }

  public async generatePasswordHash(): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  // public static async findByLogin(login: string): Promise<User | null> {
  //   let user = await User.findOne({
  //     where: {username: login}
  //   });
  
  //   if (!user) {
  //     user = await User.findOne({
  //       where: {email: login}
  //     });
  //   }
  
  //   return user;
  // }
}

// User.beforeCreate(async user => {
//   user.password = await user.generatePasswordHash();
// });

export enum UserRole {
  ADMIN = 'ADMIN'
};
