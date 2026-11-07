import type { ReactNode } from 'react';
import { WorkspaceProvider } from '../../features/workspace/workspace-context';
import { WorkspaceShell } from '../../features/workspace/workspace-shell';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
