import DataLoader from "dataloader";
import { getUserLoader } from "./user";


const createLoaders = () => {
    return {
        userLoader: new DataLoader((ids: readonly  number[]) => getUserLoader(ids)),
    }
}
  
export default createLoaders;