CREATE TABLE public.storefront_rails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  href TEXT NOT NULL DEFAULT 'yeni-gelenler',
  sort_order INTEGER NOT NULL DEFAULT 0,
  min_products INTEGER NOT NULL DEFAULT 4 CHECK (min_products BETWEEN 1 AND 24),
  max_products INTEGER NOT NULL DEFAULT 8 CHECK (max_products BETWEEN 1 AND 24 AND max_products >= min_products),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.storefront_rails TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.storefront_rails TO authenticated;
GRANT ALL ON public.storefront_rails TO service_role;
ALTER TABLE public.storefront_rails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active storefront rails" ON public.storefront_rails FOR SELECT TO anon USING (is_active);
CREATE POLICY "Users read active or admins all storefront rails" ON public.storefront_rails FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins insert storefront rails" ON public.storefront_rails FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update storefront rails" ON public.storefront_rails FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete storefront rails" ON public.storefront_rails FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER set_storefront_rails_updated_at BEFORE UPDATE ON public.storefront_rails FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.storefront_rail_products (
  rail_id UUID NOT NULL REFERENCES public.storefront_rails(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (rail_id, product_id)
);
GRANT SELECT ON public.storefront_rail_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.storefront_rail_products TO authenticated;
GRANT ALL ON public.storefront_rail_products TO service_role;
ALTER TABLE public.storefront_rail_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products of active storefront rails" ON public.storefront_rail_products FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.storefront_rails r WHERE r.id = rail_id AND r.is_active));
CREATE POLICY "Users read active rail products or admins all" ON public.storefront_rail_products FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.storefront_rails r WHERE r.id = rail_id AND (r.is_active OR public.has_role(auth.uid(), 'admin'::public.app_role))));
CREATE POLICY "Admins insert storefront rail products" ON public.storefront_rail_products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins update storefront rail products" ON public.storefront_rail_products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins delete storefront rail products" ON public.storefront_rail_products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX storefront_rails_sort_order_idx ON public.storefront_rails(sort_order);
CREATE INDEX storefront_rail_products_order_idx ON public.storefront_rail_products(rail_id, sort_order);