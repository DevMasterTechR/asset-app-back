// prisma/prisma.config.ts
export const prismaConfig = {
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
};

export default prismaConfig;