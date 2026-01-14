import { useSearchParams } from 'react-router-dom';
import { LabList } from '@/components/labs/LabList';
import { LabDetail } from '@/components/labs/LabDetail';
import { useIframeResize } from '@/hooks/useIframeResize';

export default function Labs() {
  const [searchParams] = useSearchParams();
  
  // Enable iframe auto-height for WordPress embedding
  useIframeResize();
  
  const view = searchParams.get('view');
  const labId = searchParams.get('lab');

  // Show lab detail if lab ID is provided
  if (labId) {
    return (
      <div className="embed-container">
        <div className="container max-w-5xl py-8 px-4">
          <LabDetail labId={labId} />
        </div>
      </div>
    );
  }

  // Default to list view
  return (
    <div className="embed-container">
      <div className="container max-w-6xl py-8 px-4">
        <LabList />
      </div>
    </div>
  );
}
