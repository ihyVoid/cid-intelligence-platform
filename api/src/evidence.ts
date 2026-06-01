import { FastifyInstance } from 'fastify'

import { prisma } from './prisma'

export async function evidenceRoutes(app: FastifyInstance) {

  app.post('/evidence', async (request) => {

    const body = request.body as any

    return prisma.evidence.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        classification: body.classification,
        priority: body.priority,
        status: body.status,
        tags: body.tags,
        fileUrl: body.fileUrl,
        thumbnailUrl: body.thumbnailUrl,
        collectedBy: body.collectedBy,
        caseId: body.caseId
      }
    })
  })

  app.get('/evidence/:caseId', async (request) => {

    const params = request.params as any

    return prisma.evidence.findMany({
      where: {
        caseId: params.caseId
      }
    })
  })
}