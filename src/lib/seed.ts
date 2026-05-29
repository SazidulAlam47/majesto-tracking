// src/lib/seed.ts
import User from './models/User';
import { hashPassword } from '@/helpers/auth';

let seeded = false;

export async function seedAdmin(): Promise<void> {
  if (seeded) return;

  try {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('Admin email or password not set in environment variables. Skipping seed.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword);

      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        type: 'admin',
        status: 'approved',
      });

      console.log('✅ Admin user seeded successfully');
    } else {
      console.log('ℹ️  Admin user already exists, skipping seed');
    }

    seeded = true;
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  }
}
