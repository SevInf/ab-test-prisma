import { PrismaClient, Prisma, User, ExperimentVariant, EventType } from '../node_modules/.prisma/client'

const NUM_USERS = 1000
const COUNT_BLUE = 300

const prisma = new PrismaClient()
async function main() {
  const usersInput: Prisma.UserCreateInput[] = []
  for (let i = 0; i < NUM_USERS; i++) {
    usersInput.push({
      email: `user${i}@example.com`,
    })
  }
  const users = await prisma.user.createManyAndReturn({ data: usersInput })
  await createFunnel(users.slice(0, COUNT_BLUE), ExperimentVariant.BlueBuyButton)
  await createFunnel(users.slice(COUNT_BLUE), ExperimentVariant.GreenBuyButton)
}

async function createFunnel(users: User[], variant: ExperimentVariant) {
  for (const event of [
    EventType.PageOpened,
    EventType.ProductPutInShoppingCart,
    EventType.AddressFilled,
    EventType.AddressFilled,
    EventType.CheckedOut,
  ]) {
    await createEvents(users, variant, event)
    users = pickRandomSubset(users)
  }
}

function pickRandomSubset(users: User[]): User[] {
  let amount = 1 + Math.floor(Math.random() * (users.length - 1))
  const result: User[] = []
  while (amount > 0) {
    const idx = Math.floor(Math.random() * users.length)
    const user = users[idx]
    if (!result.includes(user)) {
      result.push(user)
      amount--;
    }
  }
  return result
}

async function createEvents(users: User[], variant: ExperimentVariant, event: EventType) {
  const eventsData = users.map(
    (user) =>
      ({
        variant,
        type: event,
        userId: user.id,
      } satisfies Prisma.TrackingEventCreateManyInput),
  )
  await prisma.trackingEvent.createMany({ data: eventsData })
}

main()
