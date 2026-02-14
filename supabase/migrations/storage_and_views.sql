-- 1. Create Storage Bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Admins can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (SELECT role FROM public.barbers WHERE user_id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (SELECT role FROM public.barbers WHERE user_id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (SELECT role FROM public.barbers WHERE user_id = auth.uid()) = 'admin'
  );

-- 3. View to allow admins to see auth users for linking
-- We use security_invoker = false (default) to use the view owner's permissions (postgres)
CREATE OR REPLACE VIEW public.available_users WITH (security_invoker = false) AS
  SELECT id, email FROM auth.users;

GRANT SELECT ON public.available_users TO authenticated;
-- Note: In a real production app, you might want to restrict this view
-- even more, but for this admin MVP, it allows the selector to work.
