/**
 * `npm run seed:admin` — create (or upgrade) the bootstrap admin user.
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from env. Idempotent:
 *   - if the user doesn't exist → creates it as role=admin
 *   - if it exists with role=user → promotes to admin (does not change password)
 *   - if it's already admin → no-op
 */
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

async function main() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    console.error('[seed:admin] Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }
  await connectDB();

  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[seed:admin] Promoted ${existing.email} to admin.`);
    } else {
      console.log(`[seed:admin] ${existing.email} is already an admin. No changes.`);
    }
  } else {
    const u = new User({ name: env.ADMIN_NAME, email: env.ADMIN_EMAIL, role: 'admin' });
    u.password = env.ADMIN_PASSWORD;
    await u.save();
    console.log(`[seed:admin] Created admin user: ${u.email}`);
  }
  await disconnectDB();
}

main().catch((err) => {
  console.error('[seed:admin] error:', err);
  process.exit(1);
});
