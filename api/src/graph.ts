import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'

export async function graphRoutes(app: FastifyInstance) {

  /* =========================
     GET GRAPH
  ========================= */

  app.get('/graph/:caseId', async (req: any) => {

    const { caseId } = req.params

    const nodes = await prisma.graphNode.findMany({
      where: {
        caseId
      }
    })

    const edges = await prisma.graphEdge.findMany({
      where: {
        caseId
      }
    })

    return {
      nodes,
      edges
    }
  })

  /* =========================
     CREATE NODE
  ========================= */

  app.post('/graph/node', async (req: any) => {

    const body = req.body

    const node = await prisma.graphNode.create({

      data: {

        caseId: body.caseId,

        nodeType: body.nodeType,

        title: body.title,

        x: body.x,

        y: body.y,

        metadata: body.metadata || ''

      }

    })

    return node
  })

  /* =========================
     CREATE EDGE
  ========================= */

  app.post('/graph/edge', async (req: any) => {

    const body = req.body

    const edge = await prisma.graphEdge.create({

      data: {

        caseId: body.caseId,

        source: body.source,

        target: body.target,

        label: body.label || ''

      }

    })

    return edge
  })

  /* =========================
     UPDATE POSITION
  ========================= */

  app.put('/graph/node/:id', async (req: any) => {

    const { id } = req.params

    const body = req.body

    const node = await prisma.graphNode.update({

      where: {
        id
      },

      data: {

        x: body.x,
        y: body.y

      }

    })

    return node
  })

}