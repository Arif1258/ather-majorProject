import dbConnect from '@/lib/mongoose';
import { Website } from '@/models/Website';
import { AnalyticsDashboard } from '@/components/ui/AnalyticsDashboard';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';

export const runtime = 'nodejs';
export const revalidate = 0;

export default async function AnalyticsPage(props: { searchParams: Promise<{ websiteId?: string }> }) {
  let serializedSites: { id: string, name: string }[] = [];
  
  try {
    await dbConnect();
    const sites = await Website.find({}, '_id name url').lean();
    serializedSites = sites.map((s: Record<string, unknown>) => ({ 
        id: s._id?.toString() || '', 
        name: (s.name as string) || (s.url as string) 
    }));
  } catch (err) {
    console.error("Failed to load sites for analytics", err);
  }

  const sp = await props.searchParams;
  const initialWebsiteId = sp.websiteId || 'all';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black p-4 sm:p-8">
         <AnalyticsDashboard initialSites={serializedSites} preselectedWebsiteId={initialWebsiteId} />
      </div>
    </ProtectedRoute>
  );
}
