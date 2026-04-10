import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { SystemDashboard } from '@/components/ui/SystemDashboard';

export const metadata = {
  title: 'System Telemetry | AetherMonitor',
};

export default function SystemPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black p-4 sm:p-8 pt-24">
         <SystemDashboard />
      </div>
    </ProtectedRoute>
  );
}
