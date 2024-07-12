import { PrismaClient } from './node_modules/.prisma/client'

async function main() {
  const prisma = new PrismaClient()

  const stats = await prisma.$queryRaw`
    select variant, checked_out::FLOAT / opened::FLOAT as conversion
    from (
      select
        variant,
        count(*) filter (where type='PageOpened') as opened,
        count(*) filter (where type='CheckedOut') as checked_out
      from 
        "TrackingEvent" as te
      group by variant
    ) as counts
    order by conversion desc
  `
  console.log(stats)
}

main()
