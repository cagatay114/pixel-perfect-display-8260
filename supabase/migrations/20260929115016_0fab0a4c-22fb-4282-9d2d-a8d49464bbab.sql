CREATE TABLE public.customer_shop_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cart JSONB NOT NULL DEFAULT '[]'::jsonb,
  favorites JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_shop_state TO authenticated;
GRANT ALL ON public.customer_shop_state TO service_role;
ALTER TABLE public.customer_shop_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shop state" ON public.customer_shop_state FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER customer_shop_state_updated_at BEFORE UPDATE ON public.customer_shop_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();