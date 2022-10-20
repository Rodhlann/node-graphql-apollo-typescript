import pkg from 'graphql-iso-date';
const { GraphQLDateTime } = pkg;

import userResolvers from './user';
import messageResolvers from './message';

const customScalarResolver = {
  Date: GraphQLDateTime
};

export default [userResolvers, messageResolvers, customScalarResolver];
