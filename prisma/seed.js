require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("../src/config/prisma");

async function main() {
  // roleid = 1 PHẢI là CUSTOMER vì register đang gán cứng roleid: 1
  const roles = [
    { roleid: 1, rolename: "CUSTOMER" },
    { roleid: 2, rolename: "ADMIN" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { roleid: r.roleid },
      update: { rolename: r.rolename },
      create: r,
    });
  }

  const memberships = [
    { mid: 1, mname: "Bronze", score: 0 },
    { mid: 2, mname: "Silver", score: 100 },
    { mid: 3, mname: "Gold", score: 500 },
  ];
  for (const m of memberships) {
    await prisma.memberShip.upsert({
      where: { mid: m.mid },
      update: { mname: m.mname, score: m.score },
      create: m,
    });
  }

  const adminUsername = process.env.SEED_ADMIN_USERNAME;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminUsername && adminPassword) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { username: adminUsername },
      update: {password: hashed},
      create: {
        username: adminUsername,
        fullname: "Administrator",
        password: hashed,
        roleid: 2,
        mid: 1,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });