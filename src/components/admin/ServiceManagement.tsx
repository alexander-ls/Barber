'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Edit2, Scissors } from 'lucide-react';

const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  price: z.preprocess((val) => Number(val), z.number().min(0)),
  duration_minutes: z.preprocess((val) => Number(val), z.number().min(1)),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export function ServiceManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      duration_minutes: 30,
    },
  });

  const upsertServiceMutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const payload = {
        name: values.name,
        price: values.price,
        duration_minutes: values.duration_minutes,
      };

      let error;
      if (editingId) {
        ({ error } = await (supabase
          .from('services') as any)
          .update(payload)
          .eq('id', editingId));
      } else {
        ({ error } = await (supabase.from('services') as any).insert(payload));
      }

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success(editingId ? 'Servicio actualizado' : 'Servicio creado');
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Error al guardar: ' + error.message);
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Servicio eliminado');
    },
  });

  const resetForm = () => {
    form.reset({ name: '', price: 0, duration_minutes: 30 });
    setEditingId(null);
  };

  const onEdit = (service: any) => {
    setEditingId(service.id);
    form.reset({
      name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes,
    });
    setIsOpen(true);
  };

  const onSubmit = (values: ServiceFormValues) => {
    upsertServiceMutation.mutate(values);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
        <Dialog open={isOpen} onOpenChange={(val) => { if(!val) resetForm(); setIsOpen(val); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
              <DialogDescription>
                Define los detalles del servicio ofrecido.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sname">Nombre</Label>
                <Input id="sname" {...form.register('name')} placeholder="Corte de Cabello" />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprice">Precio ($)</Label>
                  <Input id="sprice" type="number" step="0.01" {...form.register('price')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sduration">Duración (min)</Label>
                  <Input id="sduration" type="number" {...form.register('duration_minutes')} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={upsertServiceMutation.isPending}>
                  {upsertServiceMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    {service.name}
                  </div>
                </TableCell>
                <TableCell>${service.price}</TableCell>
                <TableCell>{service.duration_minutes} min</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if(confirm('¿Seguro?')) deleteServiceMutation.mutate(service.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
