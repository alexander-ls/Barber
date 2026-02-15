import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { addMinutes, isAfter, isBefore, parseISO, setHours, setMinutes, startOfDay, getDay } from 'date-fns';
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

      const dayOfWeek = getDay(date);

      // Fetch working hours for this barber and day
      const { data: workingHours, error: whError } = await (supabase
        .from('working_hours') as any)
        .select('*')
        .eq('barber_id', barberId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .single();

      if (whError && whError.code !== 'PGRST116') throw whError;

      // If no working hours defined or inactive, no slots available
      if (!workingHours) return [];

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
      const [startH, startM] = workingHours.start_time.split(':').map(Number);
      const [endH, endM] = workingHours.end_time.split(':').map(Number);

      let currentSlot = setMinutes(setHours(startOfDay(date), startH), startM);
      const dayEnd = setMinutes(setHours(startOfDay(date), endH), endM);

      const STEP = 15; // Starting slots every 15 minutes to allow better fit

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

        currentSlot = addMinutes(currentSlot, STEP);
      }

      return slots;
    },
  });
}
