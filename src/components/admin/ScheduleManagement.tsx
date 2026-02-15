'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Clock, Save, Loader2 } from 'lucide-react';

const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

interface WorkingHour {
  id?: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function ScheduleManagement() {
  const queryClient = useQueryClient();
  const [localHours, setLocalHours] = useState<WorkingHour[]>([]);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    }
  });

  const { data: remoteHours, isLoading: isLoadingHours } = useQuery({
    queryKey: ['working-hours', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('working_hours') as any)
        .select('*')
        .eq('barber_id', profile!.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return data as WorkingHour[];
    }
  });

  useEffect(() => {
    if (remoteHours && profile) {
      // Merge remote hours with all 7 days
      const fullHours = Array.from({ length: 7 }, (_, i) => {
        const remote = remoteHours.find(rh => rh.day_of_week === i);
        return remote || {
          barber_id: profile.id,
          day_of_week: i,
          start_time: '09:00',
          end_time: '18:00',
          is_active: i !== 0, // Inactive on Sundays by default
        };
      });
      setLocalHours(fullHours);
    } else if (profile && !isLoadingHours && !remoteHours) {
        // Initial state if no hours in DB and we are done loading
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
            barber_id: profile.id,
            day_of_week: i,
            start_time: '09:00',
            end_time: '18:00',
            is_active: i !== 0,
          }));
          setLocalHours(defaultHours);
    }
  }, [remoteHours, profile, isLoadingHours]);

  const saveMutation = useMutation({
    mutationFn: async (hours: WorkingHour[]) => {
      const { error } = await (supabase
        .from('working_hours') as any)
        .upsert(
          hours.map(h => ({
            barber_id: h.barber_id,
            day_of_week: h.day_of_week,
            start_time: h.start_time,
            end_time: h.end_time,
            is_active: h.is_active,
          })),
          { onConflict: 'barber_id, day_of_week' }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      toast.success('Horario guardado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  const handleUpdate = (dayIndex: number, updates: Partial<WorkingHour>) => {
    setLocalHours(prev => prev.map((h, i) => i === dayIndex ? { ...h, ...updates } : h));
  };

  if (isLoadingProfile || isLoadingHours) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  if (!profile) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Mi Horario Laboral
        </CardTitle>
        <CardDescription>
          Define tu jornada para cada día de la semana. Los clientes solo podrán reservar en estos rangos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {DAYS.map((day, index) => {
            const hour = localHours[index];
            if (!hour) return null;

            return (
              <div key={day} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-colors ${hour.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id={`active-${index}`}
                      checked={hour.is_active}
                      onChange={(e) => handleUpdate(index, { is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                  <Label htmlFor={`active-${index}`} className="font-bold min-w-[100px] cursor-pointer">
                    {day}
                  </Label>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Desde</Label>
                    <Input
                      type="time"
                      value={hour.start_time.substring(0, 5)}
                      onChange={(e) => handleUpdate(index, { start_time: e.target.value })}
                      disabled={!hour.is_active}
                      className="w-[120px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Hasta</Label>
                    <Input
                      type="time"
                      value={hour.end_time.substring(0, 5)}
                      onChange={(e) => handleUpdate(index, { end_time: e.target.value })}
                      disabled={!hour.is_active}
                      className="w-[120px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={() => saveMutation.mutate(localHours)}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
