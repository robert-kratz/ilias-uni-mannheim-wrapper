import { setShowCurrentDirectory } from '../state/slice';
import { OpenDirectoryResponse } from '../types/objects';
import useRenderState from './useRenderState';

type Props = {
    onError: (error: string) => void;
};

type PageNavigation = {
    openPage: (pageId: string, doCache?: boolean) => void;
    closePages: () => void;
    currentPageId: OpenDirectoryResponse | null;
};

export default function usePageNavigation({ onError }: Props): PageNavigation {
    const { appState, dispatch } = useRenderState();

    let currentPageId = appState.showCurrentDirectory;

    const openPage = (pageId: string, doCache?: boolean) => {
        if (window.api) {
            try {
                window.api
                    .openDirectory(pageId, doCache)
                    .then((value: OpenDirectoryResponse) => {
                        dispatch(setShowCurrentDirectory({ showCurrentDirectory: value }));
                    })
                    .catch((error: string) => {
                        console.error('Error opening directory: ', error);
                        onError(error);
                    });
            } catch (error) {
                console.error('Error opening directory: ', error);
                onError(error);
            }
        }
    };

    const closePages = () => {
        dispatch(setShowCurrentDirectory({ showCurrentDirectory: null }));
    };

    return { openPage, closePages, currentPageId };
}
