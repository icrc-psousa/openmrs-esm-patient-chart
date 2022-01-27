import { useEffect, useMemo, useState } from 'react';
import { WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import { getWorkspaceStore, closeWorkspace, OpenWorkspace } from '@openmrs/esm-patient-common-lib'; 

export interface WorkspacesInfo {
  active: boolean;
  windowState: WorkspaceWindowState;
  workspaces: Array<Workspace>;
  workspaceNeedingConfirmationToOpen: OpenWorkspace;
}

export interface Workspace extends OpenWorkspace {
  closeWorkspace(): void;
}

export function useWorkspaces(): WorkspacesInfo {
  const [workspaces, setWorkspaces] = useState<Array<Workspace>>([]);
  const [workspaceNeedingConfirmationToOpen, setWorkspaceNeedingConfirmationToOpen] = useState<OpenWorkspace>(null);

  useEffect(() => {
    getWorkspaceStore().subscribe((state) => {
      setWorkspaces(state.openWorkspaces.map(w => ({ ...w, closeWorkspace: () => closeWorkspace(w.name)})));
      setWorkspaceNeedingConfirmationToOpen(state.workspaceNeedingConfirmationToOpen);
    })
  }, []);

  const windowState = useMemo(() => {
    if (workspaces.length === 0) {
      return WorkspaceWindowState.hidden;
    } else if (workspaces.length === 1) {
      return workspaces[0].preferredWindowSize;
    }
  }, [workspaces]);

  return {
    active: workspaces.length > 0,
    windowState,
    workspaces,
    workspaceNeedingConfirmationToOpen
  };
}
