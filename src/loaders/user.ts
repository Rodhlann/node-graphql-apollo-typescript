import models from '../models';

export const batchUsers = async (keys: string[], model: typeof models) => {
  // const users = await model.User.findAll({
  //   where: {
  //     id: {
  //       [Op.in]: keys,
  //     },
  //   },
  // });

  // return keys.map(key => users.find(user => user.id === key));
};