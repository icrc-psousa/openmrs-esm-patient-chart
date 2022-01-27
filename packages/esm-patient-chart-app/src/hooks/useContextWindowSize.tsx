import React, { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useWorkspaces } from './useWorkspaces';
import { WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';

interface WindowSize {
  size: WorkspaceWindowState;
}

interface ContextWindowSizeContextShape {
  windowSize: WindowSize;
  updateWindowSize?(value: WorkspaceWindowState): any;
  openWindows: number;
}

const reducer = (state: WindowSize, action: WorkspaceWindowState) => {
  switch (action) {
    case WorkspaceWindowState.minimized:
    case WorkspaceWindowState.reopened:
      return { size: WorkspaceWindowState.normal };
    default:
      return { size: action };
  }
};

const ContextWindowSizeContext = createContext<ContextWindowSizeContextShape>({
  windowSize: { size: WorkspaceWindowState.normal },
  openWindows: 0,
});

export const useContextWorkspace = () => {
  const value = useContext(ContextWindowSizeContext);
  return value;
};

export const ContextWindowSizeProvider: React.FC = ({ children }) => {
  const initialValue: WindowSize = { size: WorkspaceWindowState.normal };
  const [contextWorkspaceWindowSize, updateContextWorkspaceWindowSize] = React.useReducer(reducer, initialValue);
  const { workspaces: extensions, windowState: screenMode } = useWorkspaces();

  useEffect(() => {
    if (extensions.length > 0 && screenMode === WorkspaceWindowState.maximized) {
      updateContextWorkspaceWindowSize(WorkspaceWindowState.maximized);
    } else {
      updateContextWorkspaceWindowSize(WorkspaceWindowState.reopened);
    }
  }, [extensions.length, screenMode]);

  const updateWindowSize = useCallback((action: WorkspaceWindowState) => {
    updateContextWorkspaceWindowSize(action);
  }, []);

  const windowSizeValue = useMemo(() => {
    return {
      windowSize: contextWorkspaceWindowSize,
      updateWindowSize: updateWindowSize,
      openWindows: extensions.length,
    };
  }, [contextWorkspaceWindowSize, extensions.length, updateWindowSize]);

  return <ContextWindowSizeContext.Provider value={windowSizeValue}>{children}</ContextWindowSizeContext.Provider>;
};
