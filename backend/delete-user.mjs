import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
    const user = await prisma.user.delete({
        where: { email: 'testing@gmail.com' }
    });
    console.log(`✅ Deleted user: id=${user.id}, email=${user.email}`);
} catch (e) {
    console.error('❌ Error:', e.message);
} finally {
    await prisma.$disconnect();
}
