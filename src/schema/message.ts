export default `#graphql
  extend type Query {
    messages (cursor: String, limit: Int): MessageConnection!
    message (id: ID!): Message!
  }

  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, text: String!): Message!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    endCursor: String!
    hasNextPage: Boolean!
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
  }
`;