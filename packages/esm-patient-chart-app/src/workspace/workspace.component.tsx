import React, { useEffect, useRef, useState } from 'react';
import { OpenWorkspace, renderWorkspace, WorkspaceParcel, WorkspaceWindowState } from "@openmrs/esm-patient-common-lib";
import styles from './workspace-window.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaceWindowSize } from '../hooks/useWorkspaceWindowSize';
import isEqualWith from "lodash-es/isEqualWith";
import isFunction from "lodash-es/isFunction";

interface WorkspaceProps {
  workspace: OpenWorkspace;
  patientUuid: string;
  active: boolean;
}

export function Workspace({ workspace, patientUuid, active }: WorkspaceProps) {
  const workspaceRef = useRef<HTMLDivElement>();
  const [lastRenderedWorkspace, setLastRenderedWorkspace] = useState('');
  const [lastProps, setLastProps] = useState({});
  const [parcel, setParcel] = useState<WorkspaceParcel>(null);

  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { windowSize } = useWorkspaceWindowSize();
  const maximized = windowSize.size === WorkspaceWindowState.maximized;

  const closeWorkspace = React.useMemo(() => workspace?.closeWorkspace, [workspace]);
  const props = React.useMemo(
    () => workspace && {
      closeWorkspace,
      patientUuid,
      isTablet,
      ...workspace.additionalProps
    },
    [workspace, isTablet, patientUuid],
  );

  useEffect(() => {
    if (workspaceRef.current && workspace && lastRenderedWorkspace != workspace.name) {
      console.log("running render again", workspace);
      setLastRenderedWorkspace(workspace.name);
      setLastProps(props);
      setParcel(renderWorkspace(workspaceRef.current, workspace, props));
    }
  }, [workspaceRef.current, workspace, props]);

  useEffect(() => {
    if (parcel && props && !deepEqual(props, lastProps)) {
      setLastProps(props);
      parcel.update(props);
    }
  }, [parcel, props]);

  return (<div className={`${active ? styles.fixed : styles.hide } ${maximized && !isTablet ? styles.fullWidth : styles.dynamicWidth}`}>
    <div ref={workspaceRef}></div>
  </div>)
}

const deepEqual = (o1, o2) => isEqualWith(o1, o2, (v1, v2) => {
  if (isFunction(v1) && isFunction(v2)) {
    return true;
  } else if (v1 instanceof Element && v2 instanceof Element) {
    if (v1 !== v2) {
      console.log("nodes not equal", v1, v2);
    }
    return v1 === v2;
  }
  // return `undefined` to leave comparisons to be handled by isEqual
})
