import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import { Laboratory } from '@/types/database';
import { Button } from '@/components/ui/button';

interface LabCardProps {
  lab: Laboratory;
}

export function LabCard({ lab }: LabCardProps) {
  return (
    <div className="lab-card group p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-base font-semibold text-foreground line-clamp-1 mb-1">
          {lab.name}
        </h3>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-sm truncate">{lab.head_name}</span>
        </div>
      </div>

      {/* Button */}
      {lab.explore_url ? (
        <a href={lab.explore_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <Button size="sm" className="group/btn" variant="default">
            <span>Explorează</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </a>
      ) : (
        <Link to={`/labs?lab=${lab.id}`} className="flex-shrink-0">
          <Button size="sm" className="group/btn" variant="default">
            <span>Explorează</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}
