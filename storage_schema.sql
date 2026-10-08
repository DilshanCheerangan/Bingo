-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bingo-proofs', 'bingo-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bingo-proofs');

-- Allow users to view files in the bucket
CREATE POLICY "Allow authenticated viewing"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bingo-proofs');

-- Allow authenticated users to update their files (optional)
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bingo-proofs');
