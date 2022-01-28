import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Header, HeaderGlobalBar, HeaderName } from 'carbon-components-react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import Maximize16 from '@carbon/icons-react/es/maximize/16';
import Minimize16 from '@carbon/icons-react/es/minimize/16';
import { ExtensionSlot, useLayoutType, useBodyScrollLock } from '@openmrs/esm-framework';
import { isDesktop } from '../utils';
import { useWorkspaceWindowSize } from '../hooks/useWorkspaceWindowSize';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { patientChartWorkspaceHeaderSlot } from '../constants';
import { WorkspaceWindowState } from '@openmrs/esm-patient-common-lib';
import styles from './workspace-window.scss';
import { Workspace } from './workspace.component';

interface ContextWorkspaceParams {
  patientUuid: string;
}

const WorkspaceWindow: React.FC<RouteComponentProps<ContextWorkspaceParams>> = ({ match }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const { patientUuid } = match.params;
  const { active, workspaces } = useWorkspaces();
  const { windowSize, updateWindowSize } = useWorkspaceWindowSize();

  const hidden = windowSize.size === WorkspaceWindowState.hidden;
  const maximized = windowSize.size === WorkspaceWindowState.maximized;
  const normal = windowSize.size === WorkspaceWindowState.normal;

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
        <HeaderName prefix="">{workspaces[0]?.title}</HeaderName>
        <HeaderGlobalBar>
          <ExtensionSlot extensionSlotName={patientChartWorkspaceHeaderSlot} />
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
      { workspaces.map((w, idx) => <Workspace key={w.name} workspace={w} patientUuid={patientUuid} active={idx === 0} />)}
    </aside>
  );
};

export default WorkspaceWindow;
