## Database setup

If you see an error like `Table 'delegation_db.users' doesn't exist`, the database schema has not been created yet.

- Automatic (recommended for local dev): set `DB_INIT=true` in `backend/.env` and start the backend.
- Manual: run `database/schema.sql` against your MySQL/TiDB database (create the `delegation_db` database, then the tables).
