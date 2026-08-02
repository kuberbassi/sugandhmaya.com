create table if not exists public.products (
    id text primary key,
    name text not null,
    category text not null default 'Agarbatti',
    scents jsonb not null default '[]'::jsonb,
    variants jsonb not null default '[]'::jsonb,
    description text not null,
    featured_image text not null,
    sort_order integer not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    customer jsonb not null,
    items jsonb not null,
    total numeric(10, 2) not null check (total >= 0),
    order_date timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.products to anon, authenticated;
revoke all on table public.orders from anon, authenticated;

drop policy if exists "Public catalogue is readable" on public.products;
create policy "Public catalogue is readable"
on public.products for select
to anon, authenticated
using (true);

insert into public.products (id, name, category, scents, variants, description, featured_image, sort_order)
values
('rose','Rose Agarbatti','Agarbatti','["Rose"]','[{"id":"rose-40","name":"Premium Box","sticks":40,"price":330,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"rose-20","name":"Travel Pack","sticks":20,"price":83,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','Experience the divine fragrance of fresh roses in our handcrafted agarbatti.','/media/products/product-cover.webp',1),
('mogra','Mogra Agarbatti','Agarbatti','["Mogra"]','[{"id":"mogra-40","name":"Premium Box","sticks":40,"price":330,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"mogra-20","name":"Travel Pack","sticks":20,"price":83,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','The sweet and delicate fragrance of mogra flowers in every stick.','/media/products/product-cover.webp',2),
('oudh-regular','Oudh Agarbatti','Agarbatti','["Oudh - Regular"]','[{"id":"oudh-regular-40","name":"Premium Box","sticks":40,"price":330,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"oudh-regular-20","name":"Travel Pack","sticks":20,"price":83,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','The rich and earthy aroma of oudh in every stick.','/media/products/product-cover.webp',3),
('chandan','Chandan Agarbatti','Agarbatti','["Chandan"]','[{"id":"chandan-40","name":"Premium Box","sticks":40,"price":330,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"chandan-20","name":"Travel Pack","sticks":20,"price":83,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','The sacred and divine fragrance of chandan in every stick.','/media/products/product-cover.webp',4),
('orchid','Orchid Agarbatti','Agarbatti','["Orchid"]','[{"id":"orchid-40","name":"Premium Box","sticks":40,"price":330,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"orchid-20","name":"Travel Pack","sticks":20,"price":83,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','The sweet and delicate fragrance of orchid flowers in every stick.','/media/products/product-cover.webp',5),
('oudh-premium','Oudh Premium Agarbatti','Agarbatti','["Oudh - Premium"]','[{"id":"oudh-premium-40","name":"Premium Box","sticks":40,"price":450,"images":["/media/products/product-cover.webp","/media/products/product-back.webp","/media/products/incense-sticks.webp","/media/products/product-ritual.webp"]},{"id":"oudh-premium-20","name":"Travel Pack","sticks":20,"price":113,"images":["/media/products/product-cover.webp","/media/products/ritual-lifestyle.webp"]}]','A rich and exotic blend of premium oudh.','/media/products/product-cover.webp',6)
on conflict (id) do update set
    name = excluded.name,
    category = excluded.category,
    scents = excluded.scents,
    variants = excluded.variants,
    description = excluded.description,
    featured_image = excluded.featured_image,
    sort_order = excluded.sort_order,
    updated_at = now();
