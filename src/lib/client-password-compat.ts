import { Prisma } from '@prisma/client'

export function isMissingMustChangePasswordColumn(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2022' &&
    error.message.includes('mustChangePassword')
  )
}
