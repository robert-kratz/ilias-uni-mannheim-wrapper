import { StoreType } from '../utils/appStorage';

export default async function useApplicationState(): Promise<StoreType> {
    return await window.api.getApplicationState();
}
