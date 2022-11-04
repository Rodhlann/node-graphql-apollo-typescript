import userSchema from './user';
import messageSchema from './message';

const linkSchema = `#graphql
  scalar Date
  
  type Query {
    _: Boolean!
  }

  type Mutation {
    _: Boolean!
  }

  type Subscription {
    _: Boolean!
  }
`;

export default [linkSchema, userSchema, messageSchema];