import upath from 'upath'

import {
    getSide,
    getOtherSide,
    getCurrentPane,
    setCurrentPane,
    getCurrentFiles,
    setCurrentFiles,
} from 'managers/paneManager.jsx'
import { getCurrentUser } from 'reducers/authReducer.jsx';

export const SHOW_NEW_COPY_JOB_DIALOG = '@@dialog/SHOW_NEW_COPY_JOB_DIALOG';
export const HIDE_NEW_COPY_JOB_DIALOG = '@@dialog/HIDE_NEW_COPY_JOB_DIALOG';

export const SHOW_EDIT_COPY_JOB_DIALOG = '@@dialog/SHOW_EDIT_COPY_JOB_DIALOG';
export const HIDE_EDIT_COPY_JOB_DIALOG = '@@dialog/HIDE_EDIT_COPY_JOB_DIALOG';

export const SHOW_NEW_CLOUD_CONNECTION_DIALOG = '@@dialog/SHOW_NEW_CLOUD_CONNECTION_DIALOG';
export const HIDE_NEW_CLOUD_CONNECTION_DIALOG = '@@dialog/HIDE_NEW_CLOUD_CONNECTION_DIALOG';

export const SHOW_EDIT_CLOUD_CONNECTION_DIALOG = '@@dialog/SHOW_EDIT_CLOUD_CONNECTION_DIALOG';
export const HIDE_EDIT_CLOUD_CONNECTION_DIALOG = '@@dialog/HIDE_EDIT_CLOUD_CONNECTION_DIALOG';

export const SHOW_MKDIR_DIALOG = '@@dialog/SHOW_MKDIR_DIALOG';
export const HIDE_MKDIR_DIALOG = '@@dialog/HIDE_MKDIR_DIALOG';


export const showNewCopyJobDialog = () => {
    return async (dispatch, getState) => {
        const state = getState();

        const srcSide = getSide(state.pane);
        const srcPane = getCurrentPane(state.pane, srcSide);
        const srcFiles = getCurrentFiles(state.pane, srcSide);
        const srcResourceName = srcFiles[srcPane.fileFocusIndex].name;
        const srcResourcePath = upath.join(srcPane.path, srcResourceName)

        const dstSide = getOtherSide(srcSide);
        const dstPane = getCurrentPane(state.pane, dstSide)
        const dstResourcePath = upath.join(dstPane.path, srcResourceName)

        const data = {
            source_cloud: srcPane.host,
            src_resource_path: srcResourcePath,
            destination_cloud: dstPane.host,
            destination_path: dstResourcePath,
            owner: getCurrentUser(state.auth),
        }

        dispatch({
            type: SHOW_NEW_COPY_JOB_DIALOG,
            payload: {data}
        })
    }
};

export const hideNewCopyJobDialog = () => ({
    type: HIDE_NEW_COPY_JOB_DIALOG,
});


export const showEditCopyJobDialog = (copyJob) => ({
    type: SHOW_EDIT_COPY_JOB_DIALOG,
    payload: copyJob,
});

export const hideEditCopyJobDialog = () => ({
    type: HIDE_EDIT_COPY_JOB_DIALOG,
});


export const showNewCloudConnectionDialog = () => ({
    type: SHOW_NEW_CLOUD_CONNECTION_DIALOG,
});

export const hideNewCloudConnectionDialog = () => ({
    type: HIDE_NEW_CLOUD_CONNECTION_DIALOG,
});


export const showEditCloudConnectionDialog = (data) => ({
    type: SHOW_EDIT_CLOUD_CONNECTION_DIALOG,
    payload: data,
});

export const hideEditCloudConnectionDialog = () => ({
    type: HIDE_EDIT_CLOUD_CONNECTION_DIALOG,
});

export const showMkdirDialog = (data) => {
    return async (dispatch, getState) => {
        const state = getState();
        const pane = getCurrentPane(state.pane);

        const {host, path} = pane;

        dispatch({
            type: SHOW_MKDIR_DIALOG,
            payload: {
                data: {host, path}
            },
        })
    }
};

export const hideMkdirDialog = () => ({
    type: HIDE_MKDIR_DIALOG,
});
