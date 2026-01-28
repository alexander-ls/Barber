import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { addMinutes, isAfter, isBefore, parseISO, setHours, setMinutes, startOfDay } from 'date-fns';
import { useEffect } from 'react';

export function useAvailability(barberId: string | null, date: Date | undefined, serviceDuration: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['availability'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['availability', barberId, date?.toISOString(), serviceDuration],
    enabled: !!barberId && !!date,
    queryFn: async () => {
      if (!barberId || !date) return [];

      const startOfSelectedDay = startOfDay(date).toISOString();
      const endOfSelectedDay = new Date(startOfDay(date).getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

      const { data: appointments, error } = await (supabase
        .from('appointments') as any)
        .select('start_time, end_time')
        .eq('barber_id', barberId)
        .gte('start_time', startOfSelectedDay)
        .lte('start_time', endOfSelectedDay)
        .not('status', 'eq', 'cancelled');

      if (error) throw error;

      const slots = [];
      const startTime = 9; // 9 AM
      const endTime = 20; // 8 PM

      let currentSlot = setMinutes(setHours(startOfDay(date), startTime), 0);
      const dayEnd = setMinutes(setHours(startOfDay(date), endTime), 0);

      while (isBefore(currentSlot, dayEnd)) {
        const slotStart = currentSlot;
        const slotEnd = addMinutes(slotStart, serviceDuration);

        // Check if slot end is beyond business hours
        if (isAfter(slotEnd, dayEnd)) break;

        // Check for overlap with existing appointments
        const isOccupied = (appointments as any)?.some((app: any) => {
          const appStart = parseISO(app.start_time);
          const appEnd = parseISO(app.end_time);

          // Overlap if (slotStart < appEnd) && (slotEnd > appStart)
          return isBefore(slotStart, appEnd) && isAfter(slotEnd, appStart);
        });

        // Also check if slot is in the past
        const now = new Date();
        const isPast = isBefore(slotStart, now);

        if (!isOccupied && !isPast) {
          slots.push(slotStart);
        }

        currentSlot = addMinutes(currentSlot, 30);
      }

      return slots;
    },
  });
}
