'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Scissors, Clock, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}

interface ServiceSelectionProps {
  onSelect: (service: Service) => void;
  selectedId?: string;
}

export function ServiceSelection({ onSelect, selectedId }: ServiceSelectionProps) {
  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {services?.map((service) => (
        <Card
          key={service.id}
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            selectedId === service.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onSelect(service)}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-full ${
              selectedId === service.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Scissors className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {service.description}
              </p>
              <div className="flex gap-4 text-sm font-medium">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <DollarSign className="w-4 h-4" />
                  <span>{service.price}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
