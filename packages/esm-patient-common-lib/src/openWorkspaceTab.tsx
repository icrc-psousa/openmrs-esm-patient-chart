//
// This is only used from immunizations-sequence-table.tsx. I suspect it is not used at all.
//

import { getStartedVisit } from '@openmrs/esm-framework';
import isEmpty from 'lodash-es/isEmpty';

export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}


export function openWorkspaceTab<TProps = DataCaptureComponentProps, TParams = any>(
  componentToAdd: React.FC<TProps>,
  componentName: string,
  params = {} as TParams,
  requiresVisit = true,
): void {
  console.log("here!");
  if (isEmpty(getStartedVisit.value) && requiresVisit) {
    window.dispatchEvent(
      new CustomEvent('visit-dialog', {
        detail: { type: 'prompt' },
      }),
    );
  }
}
