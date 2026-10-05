import pg from 'pg';
export const pool=new pg.Pool({connectionString:process.env.DATABASE_URL||'postgres://tantravit:tantravit@localhost:5432/tantravit'});
export const q=(t,a=[])=>pool.query(t,a).then(r=>r.rows);
