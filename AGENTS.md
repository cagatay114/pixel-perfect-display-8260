<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the shared ThemeProvider and semantic CSS tokens for all storefront and future admin colors, so one persisted preference controls the entire product.
- Store storefront-wide editable presentation values in the protected `site_settings` backend table so the future admin and public shop share one source.
- Derive best-seller ordering from completed order quantities through the shared ranking helper; never add a manual product flag.
- Keep style-advisor AI calls in the authenticated server route, validate recommendations against the current catalog, and persist one RLS-scoped conversation per user.
- Gate /admin client-side (ssr:false) via the `claim_admin_invite` RPC and enforce every admin write with `has_role` RLS policies; roles live only in `user_roles`, why: UI gates are bypassable, RLS is not.
- Store product/hero images in the private `product-images` bucket as long-lived signed URLs, why: public buckets are blocked on this project.
- Read the storefront catalog only through `catalogQuery`/`useCatalog` in src/lib/catalog.ts (primed in the root loader), why: the admin panel's database is the single product source.
