-- MorphAI Database Migration v4 — Target Face for Templates & Photoshoot Batch Support
ALTER TABLE templates ADD COLUMN IF NOT EXISTS target_face_url TEXT;
