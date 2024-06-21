import { PrismaClient } from '@prisma/client'
import { beforeEach, vi } from 'vitest'
import { mockDeep, mockReset, MockProxy } from 'vitest-mock-extended'

export const prismaClient = mockDeep<PrismaClient>();