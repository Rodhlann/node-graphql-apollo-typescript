import DataLoader from "dataloader";
import { getUsers } from "./user";


const createLoaders = () => {
    return {
        userLoader: new DataLoader((ids: readonly  number[]) => getUsers(ids)),
    }
}
  
export default createLoaders;