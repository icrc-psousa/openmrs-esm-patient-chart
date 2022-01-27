import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Header, HeaderGlobalBar, HeaderName } from 'carbon-components-react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import Maximize16 from '@carbon/icons-react/es/maximize/16';
import Minimize16 from '@carbon/icons-react/es/minimize/16';
import { ExtensionSlot, useLayoutType, useBodyScrollLock } from '@openmrs/esm-framework';
import { isDesktop } from '../utils';
import { useContextWorkspace } from '../hooks/useContextWindowSize';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { patientChartWorkspaceHeaderSlot } from '../constants';
import { renderWorkspace, WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import styles from './context-workspace.scss';

interface ContextWorkspaceParams {
  patientUuid: string;
}

const ContextWorkspace: React.FC<RouteComponentProps<ContextWorkspaceParams>> = ({ match }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const workspaceRef = useRef<HTMLDivElement>();

  const { patientUuid } = match.params;
  const { active, workspaces } = useWorkspaces();
  const { windowSize, updateWindowSize } = useContextWorkspace();
  const { size } = windowSize;

  const activeWorkspace = workspaces[0];

  const hidden = size === WorkspaceWindowState.hidden;
  const maximized = size === WorkspaceWindowState.maximized;
  const normal = size === WorkspaceWindowState.normal;

  const props = React.useMemo(
    () => ({ closeWorkspace: activeWorkspace.closeWorkspace, patientUuid, isTablet }),
    [activeWorkspace, isTablet, patientUuid],
  );

  const [isWorkspaceWindowOpen, setIsWorkspaceWindowOpen] = useState(false);

  useEffect(() => {
    if (active && (maximized || normal)) {
      setIsWorkspaceWindowOpen(true);
    } else if (workspaces.length && hidden) {
      setIsWorkspaceWindowOpen(false);
    } else {
      setIsWorkspaceWindowOpen(false);
    }
  }, [workspaces.length, hidden, maximized, normal]);

  useEffect(() => {
    return renderWorkspace(workspaceRef.current, activeWorkspace);
  }, [activeWorkspace]);

  useBodyScrollLock(active && !isDesktop(layout));

  const toggleWindowState = () => {
    maximized ? updateWindowSize(WorkspaceWindowState.minimized) : updateWindowSize(WorkspaceWindowState.maximized);
  };

  return (
    <aside
      className={`${styles.container} ${maximized ? `${styles.maximized}` : undefined} ${
        isWorkspaceWindowOpen
          ? `${styles.show}`
          : `${styles.hide}
      }`
      }`}
    >
      <Header
        aria-label="Workspace Title"
        className={`${styles.header} ${maximized ? `${styles.fullWidth}` : `${styles.dynamicWidth}`}`}
      >
        <HeaderName prefix="">{activeWorkspace?.title}</HeaderName>
        <HeaderGlobalBar>
          <ExtensionSlot extensionSlotName={patientChartWorkspaceHeaderSlot} state={props} />
          <Button
            iconDescription={maximized ? t('minimize', 'Minimize') : t('maximize', 'Maximize')}
            hasIconOnly
            kind="ghost"
            onClick={toggleWindowState}
            renderIcon={maximized ? Minimize16 : Maximize16}
            tooltipPosition="bottom"
          />
          <Button
            iconDescription={t('hide', 'Hide')}
            hasIconOnly
            kind="ghost"
            onClick={() => updateWindowSize(WorkspaceWindowState.hidden)}
            renderIcon={ArrowRight16}
            tooltipPosition="bottom"
            tooltipAlignment="end"
          />
        </HeaderGlobalBar>
      </Header>
      <div className={`${styles.fixed} ${maximized && !isTablet ? `${styles.fullWidth}` : `${styles.dynamicWidth}`}`}>
        <div ref={workspaceRef}></div>
      </div>
    </aside>
  );
};

export default ContextWorkspace;
