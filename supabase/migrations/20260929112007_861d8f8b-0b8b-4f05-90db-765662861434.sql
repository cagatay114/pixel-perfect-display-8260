CREATE TABLE public.style_advisor_conversations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT style_advisor_messages_array CHECK (jsonb_typeof(messages) = 'array')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.style_advisor_conversations TO authenticated;
GRANT ALL ON public.style_advisor_conversations TO service_role;

ALTER TABLE public.style_advisor_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their style advisor conversation"
ON public.style_advisor_conversations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their style advisor conversation"
ON public.style_advisor_conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their style advisor conversation"
ON public.style_advisor_conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their style advisor conversation"
ON public.style_advisor_conversations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_style_advisor_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_style_advisor_conversations_updated_at
BEFORE UPDATE ON public.style_advisor_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_style_advisor_updated_at();