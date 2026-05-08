@AGENTS.md

ADMIN ROLES — CURRENT IMPLEMENTATION

All three admins (Prathik, Suhan, Sumanth) have 
identical super admin access. No permission 
restrictions between them at this stage.

Single role in DB: 'admin'
Checked in middleware: user exists in admin_roles table

Default landing page per user is set via a 
defaultSection field in admin_roles table.
This is purely a UX preference — not a permission.

MODULARITY REQUIREMENT:
All admin actions must go through service functions 
in src/lib/admin/. Never call Supabase directly 
from admin page components. This ensures that when 
role-based restrictions are added later, they only 
need to be added in one place — the service layer.

Future role system is already designed (see ideation).
Adding it later = adding checks to service functions 
+ updating admin_roles table. Zero UI rewrite needed.
