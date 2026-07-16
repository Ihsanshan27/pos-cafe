const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const outlets = await prisma.outlet.findMany({ select: { id: true, name: true, slug: true } });
  console.log("OUTLETS:");
  console.log(outlets);

  const stocks = await prisma.outletIngredient.findMany({
    include: {
      outlet: { select: { name: true } },
      ingredient: { select: { name: true } },
    }
  });
  
  console.log("\nSTOCKS:");
  for (const s of stocks) {
    console.log(`${s.outlet.name} - ${s.ingredient.name}: ${s.stockQuantity}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
