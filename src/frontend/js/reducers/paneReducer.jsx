import * as pane from 'actions/paneActions.jsx';
import * as api from 'actions/apiActions.jsx';
import * as auth from 'actions/authActions.jsx';

import fileManager from 'managers/fileManager.jsx'
import {
    getSide,
    getOtherSide,
    getCurrentPane,
    setCurrentPane,
    getCurrentFiles,
    setCurrentFiles,
} from 'managers/paneManager.jsx';
import constants from 'constants.jsx';


const INITIAL_PANE = {
    host: {
        id: 0,
        name: constants.local_name,
        type: 'file',
        access_key_id: '',
        access_key_secret: '',
        aws_session_token: '',
        region: '',
    },
    path: '/',
    sortingColumn: 'name',
    sortingAsc: true,
    fileFocusIndex: 0,
    history: [],
    fileSelectedIndexes: {},
}

const initialState = {
    homeDir: '~',
    showHiddenFiles: false,
    focusPaneLeft: true,
    indexes: {
        left: 0,
        right: 0,
    },
    panes: {
        left: [INITIAL_PANE],
        right: [INITIAL_PANE],
    },
    files: {
        left: [],
        right: [],
    },
};

export default (state=initialState, action) => {
    switch(action.type) {
    case pane.SIDE_FOCUS: {
        return {
            ...state,
            focusPaneLeft: (action.payload.side === 'left'),
        }
    }
    case pane.FILE_FOCUS_INDEX: {
        const index = action.payload.index;
        const side = action.payload.side || getSide(state);
        const focusPaneLeft = side === 'left';
        return {
            ...state,
            focusPaneLeft,
            panes: {
                ...setCurrentPane(state, {
                    ...getCurrentPane(state, side),
                    fileFocusIndex: index,
                }, side)
            }
        }
    }
    case pane.DIRECTORY_CHANGE: {
        const { side, path } = action.payload;

        return {
            ...state,
            panes: {
                ...setCurrentPane(state, {
                    ...getCurrentPane(state, side),
                    fileFocusIndex: 0,
                    path,
                }, side)
            },
            files: {
                ...setCurrentFiles(
                    state,
                    [
                        {name: '..', type: 'dir'},
                        {name: "Loading..."},
                    ],
                    side,
                )
            }
        }
    }

    case pane.HOST_CHANGE: {
        const {side, host} = action.payload;

        let path = '/'
        if (host.bucket) {
            path = `/${host.bucket}`;
        }

        return {
            ...state,
            panes: {
                ...setCurrentPane(state, {
                    ...getCurrentPane(state, side),
                    fileFocusIndex: 0,
                    path,
                    host,
                }, side)
            },
            files: {
                ...setCurrentFiles(
                    state,
                    [
                        {name: '..', type: 'dir'},
                        {name: "Loading..."},
                    ],
                    side,
                )
            }
        }
    }


    case pane.TOGGLE_SHOW_HIDDEN_FILES: {
        return {
            ...state,
            showHiddenFiles: !state.showHiddenFiles,
        }
    }

    case api.LIST_FILES_REQUEST:
    case api.LIST_HOME_FILES_REQUEST:
    {
        return state;
    }

    case api.LIST_FILES_SUCCESS: {
        const { payload } = action;
        const { side, data } = action.meta;
        const { connection_id } = data;

        const { showHiddenFiles } = state;

        let {files, path} = action.payload;

        if (connection_id === 0) {
            files = fileManager.convertLocalFilesToMotuz(files)
        } else {
            files = fileManager.convertRcloneFilesToMotuz(files)
        }

        files = fileManager.filterFiles(files, {
            showHiddenFiles: state.showHiddenFiles,
        })
        files = fileManager.sortFiles(files);

        if (path !== '/') {
            files.unshift({
                'name': '..',
                'size': 'Folder',
                'type': 'dir',
            })
        }
        return {
            ...state,
            panes: {
                ...setCurrentPane(state, {
                    ...getCurrentPane(state, side),
                    path,
                }, side)
            },
            files: {
                ...setCurrentFiles(state, files, side),
            },
        }
    }

    case api.LIST_FILES_FAILURE: {
        const { side } = action.meta;

        return {
            ...state,
            files: {
                ...setCurrentFiles(
                    state,
                    [
                        {name: '..', type: 'dir'},
                        {name: "ERROR - CHECK THE CONSOLE"},
                    ],
                    side,
                ),
            },
        }
    }

    case api.LIST_HOME_FILES_SUCCESS: {
        const { payload } = action;
        const { showHiddenFiles } = state;

        let {files, path} = action.payload;

        files = fileManager.convertLocalFilesToMotuz(files)
        files = fileManager.filterFiles(files, {
            showHiddenFiles: state.showHiddenFiles,
        })
        files = fileManager.sortFiles(files);

        if (path !== '/') {
            files.unshift({
                'name': '..',
                'size': 'Folder',
                'type': 'dir',
            })
        }

        return {
            ...state,
            panes: {
                left: [{
                    ...getCurrentPane(state, 'left'),
                    path,
                }],
                right: [{
                    ...getCurrentPane(state, 'right'),
                    path,
                }],
            },
            files: {
                left: files,
                right: files.slice(), // Avoid accidenal state mutations
            },
        }
    }

    case api.LIST_HOME_FILES_FAILURE: {
        return {
            ...state,
            files: {
                left: [
                    {name: "ERROR - CHECK THE CONSOLE"},
                ],
                right: [
                    {name: "ERROR - CHECK THE CONSOLE"},
                ],
            },
        }
    }



    case auth.LOGOUT_REQUEST: {
        return initialState;
    }

    default:
        return state;
    }
};
