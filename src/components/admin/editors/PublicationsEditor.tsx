import { useState } from 'react';
import { 
  usePublicationEntries,
  useCreatePublicationEntry,
  useUpdatePublicationEntry, 
  useDeletePublicationEntry,
  usePublicationYears,
  PublicationEntry
} from '@/hooks/useLaboratories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Save, BookOpen, Calendar, GripVertical } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface PublicationsEditorProps {
  labId: string;
}

export function PublicationsEditor({ labId }: PublicationsEditorProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [showNewYearInput, setShowNewYearInput] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<PublicationEntry | null>(null);
  
  const { data: years, isLoading: yearsLoading } = usePublicationYears(labId);
  const { data: entries, isLoading: entriesLoading } = usePublicationEntries(labId, selectedYear);
  
  const createEntry = useCreatePublicationEntry();
  const updateEntry = useUpdatePublicationEntry();
  const deleteEntry = useDeletePublicationEntry();

  // Local state for editing entries
  const [editedEntries, setEditedEntries] = useState<Record<string, string>>({});
  const [newEntryContent, setNewEntryContent] = useState('');

  const handleAddYear = () => {
    if (years?.includes(newYear)) {
      toast.error(`Anul ${newYear} există deja`);
      return;
    }
    setSelectedYear(newYear);
    setShowNewYearInput(false);
  };

  const handleAddEntry = async () => {
    if (!selectedYear || !newEntryContent.trim()) return;

    const nextOrder = entries ? entries.length : 0;

    try {
      await createEntry.mutateAsync({
        lab_id: labId,
        year: selectedYear,
        content: newEntryContent.trim(),
        display_order: nextOrder
      });
      setNewEntryContent('');
      toast.success('Publicația a fost adăugată');
    } catch (error) {
      toast.error('Eroare la adăugare');
    }
  };

  const handleUpdateEntry = async (entry: PublicationEntry) => {
    const newContent = editedEntries[entry.id];
    if (newContent === undefined || newContent === entry.content) return;

    try {
      await updateEntry.mutateAsync({
        id: entry.id,
        labId,
        data: { content: newContent }
      });
      setEditedEntries(prev => {
        const updated = { ...prev };
        delete updated[entry.id];
        return updated;
      });
      toast.success('Publicația a fost actualizată');
    } catch (error) {
      toast.error('Eroare la actualizare');
    }
  };

  const handleDeleteEntry = async () => {
    if (!deletingEntry) return;

    try {
      await deleteEntry.mutateAsync({ id: deletingEntry.id, labId });
      setDeletingEntry(null);
      toast.success('Publicația a fost ștearsă');
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  const getEntryValue = (entry: PublicationEntry) => {
    return editedEntries[entry.id] !== undefined ? editedEntries[entry.id] : entry.content;
  };

  const isEntryModified = (entry: PublicationEntry) => {
    return editedEntries[entry.id] !== undefined && editedEntries[entry.id] !== entry.content;
  };

  if (yearsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-heading text-lg font-semibold">Publicații</h3>
        
        {showNewYearInput ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1900"
              max="2100"
              value={newYear}
              onChange={(e) => setNewYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-24"
            />
            <Button size="sm" onClick={handleAddYear}>Adaugă</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNewYearInput(false)}>Anulează</Button>
          </div>
        ) : (
          <Button onClick={() => setShowNewYearInput(true)}>
            <Plus className="w-4 h-4 mr-2" />
            An nou
          </Button>
        )}
      </div>

      {/* Year selection */}
      {years && years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`year-chip min-w-[70px] text-center ${selectedYear === year ? 'active' : ''}`}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {!selectedYear ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {years && years.length > 0 
              ? 'Selectați un an pentru a vedea și edita publicațiile.'
              : 'Adăugați un an pentru a începe.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h4 className="font-heading font-semibold text-xl">{selectedYear}</h4>
          </div>

          {entriesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              {/* Existing entries */}
              <div className="space-y-3">
                {entries?.map((entry, index) => (
                  <div key={entry.id} className="flex gap-3 items-start p-3 bg-card rounded-lg border border-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Textarea
                        value={getEntryValue(entry)}
                        onChange={(e) => setEditedEntries(prev => ({ ...prev, [entry.id]: e.target.value }))}
                        rows={2}
                        className="resize-none"
                        placeholder="Textul publicației..."
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      {isEntryModified(entry) && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleUpdateEntry(entry)}
                          disabled={updateEntry.isPending}
                        >
                          <Save className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => setDeletingEntry(entry)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new entry */}
              <div className="flex gap-3 items-start p-3 bg-accent/50 rounded-lg border border-dashed border-border">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                  {(entries?.length || 0) + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <Textarea
                    value={newEntryContent}
                    onChange={(e) => setNewEntryContent(e.target.value)}
                    rows={2}
                    className="resize-none"
                    placeholder="Introduceți textul publicației noi..."
                  />
                </div>
                <Button 
                  size="icon" 
                  onClick={handleAddEntry}
                  disabled={!newEntryContent.trim() || createEntry.isPending}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Fiecare publicație va fi afișată cu numărul corespunzător (1, 2, 3...). 
                Adăugați câte una pe rând în ordinea dorită.
              </p>
            </>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingEntry} onOpenChange={(open) => !open && setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge publicația?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este ireversibilă.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEntry} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
