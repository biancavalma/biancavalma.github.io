-- WhatsApp number on each profile, visible only to friends (same rules as the name)
alter table public.profiles add column if not exists phone text not null default '' check (char_length(phone) <= 20);
grant update (name, home, phone) on public.profiles to authenticated;
