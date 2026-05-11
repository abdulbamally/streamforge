// ============================================================
//  Database Seed — Development data
// ============================================================

import { PrismaClient } from '../src/generated/prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users for each plan
  const users = [
    { email: 'free@streamforge.app',       username: 'free_user',       plan: 'FREE'       as const },
    { email: 'pro@streamforge.app',        username: 'pro_user',        plan: 'PRO'        as const },
    { email: 'creator@streamforge.app',    username: 'creator_user',    plan: 'CREATOR'    as const },
    { email: 'enterprise@streamforge.app', username: 'enterprise_user', plan: 'ENTERPRISE' as const },
  ]

  const passwordHash = await argon2.hash('Password123', {
    type:        argon2.argon2id,
    memoryCost:  65536,
    timeCost:    3,
    parallelism: 4,
  })

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where:  { email: userData.email },
      update: {},
      create: {
        email:         userData.email,
        username:      userData.username,
        displayName:   `${userData.plan.charAt(0) + userData.plan.slice(1).toLowerCase()} User`,
        passwordHash,
        emailVerified: true,
        isActive:      true,
      },
    })

    await prisma.subscription.upsert({
      where:  { userId: user.id },
      update: { plan: userData.plan },
      create: {
        userId:          user.id,
        stripeCustomerId: `cus_seed_${userData.plan.toLowerCase()}`,
        plan:             userData.plan,
        status:           'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    console.log(`✅ Created ${userData.plan} user: ${userData.email}`)
  }

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
