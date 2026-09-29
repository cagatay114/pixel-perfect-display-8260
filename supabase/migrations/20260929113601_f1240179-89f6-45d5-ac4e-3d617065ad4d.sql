DROP POLICY "Public read active products" ON public.products;
CREATE POLICY "Anon read active products" ON public.products FOR SELECT TO anon USING (is_active);
CREATE POLICY "Users read active or admin all products" ON public.products FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;