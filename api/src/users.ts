// import { FastifyInstance } from 'fastify'
// import { prisma } from './prisma'

// export async function userRoutes(app: FastifyInstance) {
//     console.log(prisma)
//   // CREATE USER
//   app.post('/users', async (request, reply) => {

//     const body = request.body as any

//     try {

//       const user = await prisma.user.create({
//         data: {
//           username: body.username,
//           password: body.password,
//           role: body.role || 'agent'
//         }
//       })

//       return user

//     } catch(error) {

//         console.log(error)

//         return reply.status(400).send({
//           error
//       })

//     }

//   })

//   // LOGIN
//   app.post('/login', async (request, reply) => {

//     const body = request.body as any

//     const user = await prisma.user.findFirst({
//       where: {
//         username: body.username,
//         password: body.password
//       }
//     })

//     if (!user) {
//       return reply.status(401).send({
//         error: 'Invalid credentials'
//       })
//     }

//     return {
//       id: user.id,
//       username: user.username,
//       role: user.role
//     }

//   })

//   // GET USERS
//   app.get('/users', async () => {

//     return prisma.user.findMany({
//       orderBy: {
//         createdAt: 'desc'
//       }
//     })

//   })

// }

import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'

import { prisma } from './prisma'

export async function userRoutes(app: FastifyInstance) {

  app.post('/users', async (request, reply) => {

    const body = request.body as any

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role || 'agent'
      }
    })

    return user
  })

  app.post('/login', async (request, reply) => {

    const body = request.body as any

    const user = await prisma.user.findFirst({
      where: {
        username: body.username
      }
    })

    if (!user) {
      return reply.status(401).send({
        error: 'Invalid credentials'
      })
    }

    const passwordMatch = await bcrypt.compare(
      body.password,
      user.password
    )

    if (!passwordMatch) {
      return reply.status(401).send({
        error: 'Invalid credentials'
      })
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    }
  })

  app.get('/users', async () => {
    return prisma.user.findMany()
  })
}