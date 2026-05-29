import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log("Seed skipped: products already exist");
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        title: "Wireless Headphones",
        description: "Comfortable over-ear headphones with clear sound and long battery life.",
        price: 5999,
        imageUrl: "https://picsum.photos/seed/headphones/600/400",
        stock: 20
      },
      {
        title: "Smart Watch",
        description: "Track fitness, notifications, and heart rate in a sleek design.",
        price: 7999,
        imageUrl: "https://picsum.photos/seed/watch/600/400",
        stock: 15
      },
      {
        title: "Gaming Mouse",
        description: "High precision mouse with customizable DPI and RGB lighting.",
        price: 2499,
        imageUrl: "https://picsum.photos/seed/mouse/600/400",
        stock: 50
      },
      {
        title: "Mechanical Keyboard",
        description: "Tactile switches, solid build, perfect for typing and gaming.",
        price: 8999,
        imageUrl: "https://picsum.photos/seed/keyboard/600/400",
        stock: 10
      }
    ]
  });

  console.log("Seed completed: added products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });