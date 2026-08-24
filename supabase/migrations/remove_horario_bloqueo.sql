-- Quita citas de bloqueo interno y el servicio fantasma del catálogo.
DELETE FROM appointments
WHERE status = 'blocked'
   OR service_id IN (SELECT id FROM services WHERE name = 'Bloqueo de Horario');

DELETE FROM services WHERE name = 'Bloqueo de Horario';
