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
import { Clock, Save, Loader2, Plus, Trash2 } from 'lucide-react';

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
  const [localHours, setLocalHours] = useState<Record<number, WorkingHour[]>>({});

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
    if (profile) {
      const grouped: Record<number, WorkingHour[]> = {};
      for (let i = 0; i < 7; i++) {
        const daySlots = remoteHours?.filter(rh => rh.day_of_week === i) || [];
        grouped[i] = daySlots;
      }
      setLocalHours(grouped);
    }
  }, [remoteHours, profile]);

  const saveMutation = useMutation({
    mutationFn: async (groupedHours: Record<number, WorkingHour[]>) => {
      if (!profile) return;

      const allSlots: any[] = [];
      Object.entries(groupedHours).forEach(([day, slots]) => {
        slots.forEach(slot => {
          allSlots.push({
            barber_id: profile.id,
            day_of_week: parseInt(day),
            start_time: slot.start_time,
            end_time: slot.end_time || '23:59', // Placeholder
            is_active: true
          });
        });
      });

      // Simple sync: delete all and insert new
      const { error: deleteError } = await (supabase
        .from('working_hours') as any)
        .delete()
        .eq('barber_id', profile.id);

      if (deleteError) throw deleteError;

      if (allSlots.length > 0) {
        const { error: insertError } = await (supabase
          .from('working_hours') as any)
          .insert(allSlots);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['working-hours'] });
      toast.success('Horario guardado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  const addSlot = (dayIndex: number) => {
    setLocalHours(prev => ({
      ...prev,
      [dayIndex]: [
        ...(prev[dayIndex] || []),
        { barber_id: profile!.id, day_of_week: dayIndex, start_time: '09:00', end_time: '09:30', is_active: true }
      ]
    }));
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    setLocalHours(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].filter((_, i) => i !== slotIndex)
    }));
  };

  const updateSlot = (dayIndex: number, slotIndex: number, updates: Partial<WorkingHour>) => {
    setLocalHours(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map((s, i) => i === slotIndex ? { ...s, ...updates } : s)
    }));
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
        <div className="space-y-6">
          {DAYS.map((day, dayIndex) => {
            const slots = localHours[dayIndex] || [];

            return (
              <div key={day} className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-lg">{day}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlot(dayIndex)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Añadir Turno
                  </Button>
                </div>

                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Sin turnos definidos para este día.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group">
                        <Input
                          type="time"
                          value={slot.start_time.substring(0, 5)}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, { start_time: e.target.value })}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
