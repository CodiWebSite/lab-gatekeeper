import { Link } from 'react-router-dom';
import { ArrowRight, User, FlaskConical } from 'lucide-react';
import { Laboratory } from '@/types/database';
import { Button } from '@/components/ui/button';

interface LabCardProps {
  lab: Laboratory;
}

export function LabCard({ lab }: LabCardProps) {
  return (
    <div className="lab-card group">
      {/* Logo/Image */}
      <div className="aspect-[16/9] bg-secondary overflow-hidden">
        {lab.logo_url ? (
          <img
            src={lab.logo_url}
            alt={lab.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <FlaskConical className="w-16 h-16 text-primary/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-2 mb-2">
            {lab.name}
          </h3>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{lab.head_name}</span>
          </div>
        </div>

        {lab.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lab.description}
          </p>
        )}

        <Link to={`/labs?lab=${lab.id}`}>
          <Button className="w-full group/btn" variant="default">
            <span>Explorează</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
