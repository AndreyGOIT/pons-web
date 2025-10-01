// server/src/scripts/createAdmin.ts
import 'reflect-metadata';
import readline from 'readline';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';

async function ask(question: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<string>((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
  await AppDataSource.initialize();

  const email = process.env.ADMIN_EMAIL || (await ask('Admin email: '));
  const password = process.env.ADMIN_PASSWORD || (await ask('Admin password: '));
  const name = process.env.ADMIN_NAME || 'Admin';

  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    console.log('Admin уже существует. Обновляю пароль и имя...');
    existing.name = name;
    existing.password = await bcrypt.hash(password, 10);
    existing.role = UserRole.ADMIN;
    await repo.save(existing);
    console.log('✔ Admin обновлён');
    process.exit(0);
  }

  const admin = new User();
  admin.name = name;
  admin.email = email;
  admin.password = await bcrypt.hash(password, 10);
  admin.role = UserRole.ADMIN;
  await repo.save(admin);
  console.log('✔ Admin создан');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });