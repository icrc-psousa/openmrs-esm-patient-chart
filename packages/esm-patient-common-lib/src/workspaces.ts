import { ExtensionRegistration, getExtensionRegistration, getGlobalStore, translateFrom } from "@openmrs/esm-framework";
import { mountRootParcel, Parcel } from "single-spa";
import { WorkspaceWindowState } from ".";

export interface WorkspaceStoreState {
  openWorkspaces: Array<OpenWorkspaceInfo>;
  workspaceNeedingConfirmationToOpen: OpenWorkspaceInfo | null;
}

export interface OpenWorkspaceInfo extends WorkspaceRegistration {
  props: object
}

export interface WorkspaceRegistration {
  name: string,
  title: string,
  preferredWindowSize?: WorkspaceWindowState,
  load(): Promise<any>
}

let registeredWorkspaces = {};

export function registerWorkspace(workspace: WorkspaceRegistration) {
  registeredWorkspaces[workspace.name] = { ...workspace, preferredWindowSize: workspace.preferredWindowSize ?? WorkspaceWindowState.normal };
}

/**
 * This exists for compatibility with the old way of registering
 * workspaces (as extensions).
 * 
 * @param name of the workspace
 */
function getWorkspaceRegistration(name: string): WorkspaceRegistration {
  if (registeredWorkspaces[name]) {
    return registeredWorkspaces[name];
  } else {
    const workspaceExtension = getExtensionRegistration(name);
    return {
      name: workspaceExtension.name,
      title: getTitleFromExtension(workspaceExtension),
      preferredWindowSize: workspaceExtension.meta?.screenSize ?? WorkspaceWindowState.normal,
      load: workspaceExtension.load
    }
  }
}

function getTitleFromExtension(ext: ExtensionRegistration) {
  const title = ext?.meta?.title;
  if (typeof title === 'string') {
    return title;
  } else if (title && typeof title === 'object') {
    return translateFrom(ext.moduleName, title.key, title.default);
  }
  return ext.name;
}

export function launchPatientWorkspace(name: string, props?: object) {
  const store = getWorkspaceStore();
  const state = store.getState();
  const workspace = getWorkspaceRegistration(name);
  const newWorkspace = { ...workspace, props };
  if (state.openWorkspaces.length > 0) {
    store.setState({ ...state, workspaceNeedingConfirmationToOpen: newWorkspace })
  } else {
    store.setState({ ...state, openWorkspaces: [newWorkspace, ...state.openWorkspaces]})
  }
};

export function confirmOpeningWorkspace() {
  const store = getWorkspaceStore();
  const state = store.getState();
  const newWorkspace = state.workspaceNeedingConfirmationToOpen;
  store.setState({ openWorkspaces: [newWorkspace, ...state.openWorkspaces], workspaceNeedingConfirmationToOpen: null })
}

export function cancelOpeningWorkspace() {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, workspaceNeedingConfirmationToOpen: null })
}

export function closeWorkspace(name: string) {
  const store = getWorkspaceStore();
  const state = store.getState();
  store.setState({ ...state, openWorkspaces: state.openWorkspaces.filter(w => w.name != name) });
}

export function closeAllWorkspaces() {
  const store = getWorkspaceStore();
  store.setState({ openWorkspaces: [] });
}

export function renderWorkspace(domElement: HTMLElement, workspace: OpenWorkspaceInfo) {
  let active = true;
  let parcel: Parcel | null = null;

  if (domElement) {
    workspace.load().then(({ default: result }) => {
      if (active) {
        parcel = mountRootParcel(result, { ...workspace.props, domElement })
      }
    });
    return () => {
      active = false;
      if (parcel) {
        if (parcel.getStatus() !== "MOUNTED") {
          parcel.mountPromise.then(() => {
            if (parcel) {
              parcel.unmount();
            }
          });
        } else {
          parcel.unmount();
        }
      }
    };
  } else {
    throw new Error(`Can't render workspace ${workspace.name} into non-existant window.`);
  }
}

export function getWorkspaceStore() {
  return getGlobalStore<WorkspaceStoreState>("workspace", { openWorkspaces: [], workspaceNeedingConfirmationToOpen: null });
}




function getPreferredWindowSize(ext: ExtensionRegistration) {
  return ext.meta?.screenSize ?? WorkspaceWindowState.normal;
}
