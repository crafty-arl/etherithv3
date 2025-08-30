import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample cultural communities
  const community1 = await prisma.culturalCommunity.upsert({
    where: { id: 'community-1' },
    update: {},
    create: {
      id: 'community-1',
      name: 'Indigenous Heritage Preservation',
      description: 'A community dedicated to preserving indigenous cultural heritage and traditions.',
      culturalFocus: ['Indigenous', 'Heritage', 'Traditions'],
      location: { country: 'Global', region: 'Worldwide' },
      isVerified: true,
      verificationLevel: 3,
    },
  })

  const community2 = await prisma.culturalCommunity.upsert({
    where: { id: 'community-2' },
    update: {},
    create: {
      id: 'community-2',
      name: 'African Diaspora Cultural Network',
      description: 'Preserving and celebrating African cultural heritage across the diaspora.',
      culturalFocus: ['African', 'Diaspora', 'Culture'],
      location: { country: 'Global', region: 'Diaspora' },
      isVerified: true,
      verificationLevel: 2,
    },
  })

  console.log('✅ Database seeded successfully')
  console.log('Created communities:', { community1, community2 })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
