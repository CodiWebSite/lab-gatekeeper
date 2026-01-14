import { Laboratory } from '@/types/database';

interface LabTabDescriptionProps {
  lab: Laboratory;
}

export function LabTabDescription({ lab }: LabTabDescriptionProps) {
  if (!lab.description) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nu există descriere disponibilă pentru acest laborator.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none">
      <div 
        className="text-foreground leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: lab.description }}
      />
    </div>
  );
}
