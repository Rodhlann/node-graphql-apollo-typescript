import DataLoader from 'dataloader';
import models, { User } from "../models";
import { IncomingHttpHeaders } from 'http'
import { Request } from 'express'

export interface CustomRequest extends Request {
  headers: IncomingHttpHeaders & {
    "x-token"?: string
  }
}

export type Context = {
  models: typeof models,
  secret: string,
  me: User,
  loaders: {
    user: DataLoader<string, string>
  }
}