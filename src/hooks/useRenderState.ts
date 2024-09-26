import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { AppDispatch } from '../state/store';
import { ApplicationState } from '../state/slice';

export default function useRenderState(): {
    appState: ApplicationState;
    dispatch: AppDispatch;
} {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch<AppDispatch>();

    return { appState, dispatch };
}
