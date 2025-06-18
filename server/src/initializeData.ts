import { AppDataSource } from "./data-source";
import { Role } from "./entities/Role";

async function seed() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);

  const roles = [
    { name: "trial_user" },
    { name: "group_user" },
    { name: "admin" },
    { name: "coach" },
  ];

  for (const role of roles) {
    const exists = await roleRepo.findOneBy({ name: role.name });
    if (!exists) {
      await roleRepo.save(role);
    }
  }

  console.log("Роли добавлены!");
  process.exit();
}

seed();