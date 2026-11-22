-- Update 11: let people save the link to their own profile photo (the photo column was missing from what they may change)
grant update (name, home, phone, username, avatar_url) on public.profiles to authenticated;
