/**
 * Create an advisor/admin account from the command line.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts \
 *     --name "Your Name" --email "your@email.com" --password "your-password"
 *
 * Requires DATABASE_URL to be set in .env or environment.
 */

const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)

  function getArg(flag: string): string | undefined {
    const idx = args.indexOf(flag)
    return idx !== -1 ? args[idx + 1] : undefined
  }

  const name = getArg("--name")
  const email = getArg("--email")
  const password = getArg("--password")

  if (!name || !email || !password) {
    console.error("\nUsage:")
    console.error('  npx ts-node --compiler-options \'{"module":"CommonJS"}\' scripts/create-admin.ts \\')
    console.error('    --name "Your Name" --email "your@email.com" --password "your-password"\n')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters")
    process.exit(1)
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.error(`Error: An account with email "${email}" already exists`)
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log("\n✅ Advisor account created successfully!")
  console.log(`   Name:  ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Role:  ${user.role}`)
  console.log(`\n   Sign in at /login with these credentials.\n`)
}

main()
  .catch((e) => {
    console.error("Error:", e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
