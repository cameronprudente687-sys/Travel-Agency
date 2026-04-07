/**
 * Create an advisor/admin account from the command line.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts \
 *     --name "Your Name" --email "your@email.com" --password "your-password"
 *
 * Or use environment variables:
 *   ADMIN_NAME="Your Name" ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="password" \
 *     npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-admin.ts
 *
 * Requires DATABASE_URL to be set.
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

  // CLI args take priority, then env vars
  const name = getArg("--name") || process.env.ADMIN_NAME
  const email = getArg("--email") || process.env.ADMIN_EMAIL
  const password = getArg("--password") || process.env.ADMIN_PASSWORD

  if (!name || !email || !password) {
    console.error("\nUsage (CLI args):")
    console.error('  npx ts-node --compiler-options \'{"module":"CommonJS"}\' scripts/create-admin.ts \\')
    console.error('    --name "Tamara Prudente" --email "tamara.prudente@fora.travel" --password "your-password"')
    console.error("\nOr (env vars):")
    console.error('  ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npx ts-node ...')
    console.error("")
    process.exit(1)
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters")
    process.exit(1)
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role === "ADMIN" || existing.role === "ADVISOR") {
      console.log(`\nAdmin already exists: ${email} (${existing.role})`)
      console.log("No changes made.\n")
      return
    }
    console.error(`Error: Email "${email}" exists as a ${existing.role} account`)
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
