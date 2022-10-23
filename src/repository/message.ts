import { MySqlDataSource } from "../config/data-source";
import { Message } from "../models";

const MessageRepository = MySqlDataSource.getRepository(Message);

export default MessageRepository;
