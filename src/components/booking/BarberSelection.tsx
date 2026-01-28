'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { User, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Need Avatar component from shadcn
// I'll add it if it doesn't exist, but I'll use a simple div for now if not.
// Let's assume I can use a simple implementation for now to avoid too many shadcn adds.

export interface Barber {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface BarberSelectionProps {
  onSelect: (barber: Barber) => void;
  selectedId?: string;
}

export function BarberSelection({ onSelect, selectedId }: BarberSelectionProps) {
  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Barber[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {barbers?.map((barber) => (
        <Card
          key={barber.id}
          className={`cursor-pointer transition-all hover:border-primary/50 overflow-hidden ${
            selectedId === barber.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onSelect(barber)}
        >
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex p-6 gap-4 flex-1">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background">
                  {barber.avatar_url ? (
                    <img src={barber.avatar_url} alt={barber.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                {selectedId === barber.id && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 border-2 border-background">
                    <div className="w-3 h-3 bg-current rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight mb-1">{barber.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  "{barber.bio || 'Especialista en barbería clásica.'}"
                </p>
              </div>
            </div>
            <div className="px-6 py-3 bg-muted/30 border-t flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Info className="w-3 h-3" />
              Disponible para hoy
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
