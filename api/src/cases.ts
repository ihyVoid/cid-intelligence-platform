import { FastifyInstance } from 'fastify'

import { prisma } from './prisma'

export async function caseRoutes(app: FastifyInstance) {

  app.post('/cases', async (request) => {

    const body = request.body as any

    return prisma.case.create({
      data: {
        caseNumber: body.caseNumber,
        title: body.title,
        description: body.description,
        type: body.type,
        classification: body.classification,
        priority: body.priority,
        status: body.status,
        createdBy: body.createdBy
      }
    })
  })

  app.get('/cases', async () => {

    return prisma.case.findMany({
      include: {
        evidences: true,
        relationships: true,
        timeline: true
      }
    })
  })
}