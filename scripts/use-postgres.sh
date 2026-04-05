#!/bin/bash
# Switch Prisma to PostgreSQL for production deployment
sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
# Add directUrl if missing
if ! grep -q "directUrl" prisma/schema.prisma; then
  sed -i '/url.*=.*env("DATABASE_URL")/a\  directUrl = env("DIRECT_URL")' prisma/schema.prisma
fi
echo "Switched to PostgreSQL mode. Set DATABASE_URL and DIRECT_URL env vars."
