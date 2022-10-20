import { Table, Column, Model, HasMany, PrimaryKey, Validate, NotNull, Unique, AllowNull } from "sequelize-typescript";
import bcrypt from 'bcrypt';

import Message from "./message";

@Table
export default class User extends Model {
  // @Column
  // @PrimaryKey
  // id!: string;

  @AllowNull(false)
  @Unique
  @Validate({
    notEmpty: true
  })
  @Column
  username!: string;

  @AllowNull(false)
  @Unique
  @Validate({
    notEmpty: true,
    isEmail: true
  })
  @Column
  email!: string;

  @AllowNull(false)
  @Validate({
    notEmpty: true,
    len: [7,42]
  })
  @Column
  password!: string;

  @Column
  role!: UserRole;

  @HasMany(() => Message, {
    onDelete: "CADCADE"
  })
  messages!: Message[]

  public async generatePasswordHash(): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(this.password, saltRounds);
  }

  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public static async findByLogin(login: string): Promise<User | null> {
    let user = await User.findOne({
      where: {username: login}
    });
  
    if (!user) {
      user = await User.findOne({
        where: {email: login}
      });
    }
  
    return user;
  }
}

// User.beforeCreate(async user => {
//   user.password = await user.generatePasswordHash();
// });

enum UserRole {
  ADMIN = 'ADMIN'
};
