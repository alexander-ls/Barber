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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { UserPlus, Trash2, Camera, User } from 'lucide-react';

const barberSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  bio: z.string().optional(),
  user_id: z.string().uuid('UID inválido').nullable().or(z.literal('')),
});

type BarberFormValues = z.infer<typeof barberSchema>;

interface Barber {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  role: 'admin' | 'barber';
  user_id: string | null;
}

export function BarberManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: barbers, isLoading: isLoadingBarbers } = useQuery({
    queryKey: ['admin-barbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as Barber[];
    },
  });

  const form = useForm<BarberFormValues>({
    resolver: zodResolver(barberSchema),
    defaultValues: {
      name: '',
      bio: '',
      user_id: '',
    },
  });

  const uploadAvatar = async (barberId: string) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${barberId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createBarberMutation = useMutation({
    mutationFn: async (values: BarberFormValues) => {
      const { data, error } = await supabase.from('barbers')
        .insert({
          name: values.name,
          bio: values.bio,
          user_id: values.user_id || null,
          role: 'barber',
        })
        .select()
        .single();

      if (error) throw error;

      if (file) {
        const publicUrl = await uploadAvatar(data.id);
        if (publicUrl) {
          await supabase.from('barbers')
            .update({ avatar_url: publicUrl })
            .eq('id', data.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
      toast.success('Barbero creado correctamente');
      setIsOpen(false);
      form.reset();
      setFile(null);
    },
    onError: (error: Error) => {
      toast.error('Error al crear barbero: ' + error.message);
    },
  });

  const deleteBarberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('barbers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-barbers'] });
      toast.success('Barbero eliminado');
    },
  });

  const onSubmit = (values: BarberFormValues) => {
    createBarberMutation.mutate(values);
  };

  if (isLoadingBarbers) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Barberos</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" /> Nuevo Barbero
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Barbero</DialogTitle>
              <DialogDescription>
                Completa los datos del barbero. Ingresa el UUID del usuario registrado.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" {...form.register('name')} placeholder="Ej. Pedro Picapiedra" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Especialidad</Label>
                <Textarea id="bio" {...form.register('bio')} placeholder="Breve descripción..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_id">User UID</Label>
                <Input id="user_id" {...form.register('user_id')} placeholder="bb061844-..." />
                <p className="text-[10px] text-muted-foreground">
                  Pega aquí el UUID del usuario que se encuentra en Supabase Auth.
                </p>
                {form.formState.errors.user_id && (
                  <p className="text-xs text-destructive">{form.formState.errors.user_id.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {file && <Camera className="w-5 h-5 text-primary animate-pulse" />}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createBarberMutation.isPending}>
                  {createBarberMutation.isPending ? 'Guardando...' : 'Guardar Barbero'}
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
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {barbers?.map((barber) => (
              <TableRow key={barber.id}>
                <TableCell>
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative">
                    {barber.avatar_url ? (
                      <Image src={barber.avatar_url} alt={barber.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{barber.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {barber.bio || '-'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    barber.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {barber.role === 'admin' ? 'Admin' : 'Barbero'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if(confirm('¿Seguro que deseas eliminar este barbero?')) {
                        deleteBarberMutation.mutate(barber.id);
                      }
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
