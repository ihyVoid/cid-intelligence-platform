import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function caseRoutes(fastify: FastifyInstance) {

  fastify.get('/', async (request, reply) => {
    try {
      const cases = await prisma.case.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          suspects: true,
          victims: true,
          witnesses: true,
          evidences: true,
          timelineEvents: { orderBy: { eventTime: 'asc' } },
          reports: { orderBy: { reportNumber: 'asc' } }
        }
      })
      return { data: cases }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch cases' })
    }
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      const caseData = await prisma.case.findUnique({
        where: { id },
        include: {
          suspects: true,
          victims: true,
          witnesses: true,
          evidences: { include: { weapon: true, car: true, imageEvidence: true, document: true } },
          timelineEvents: { orderBy: { eventTime: 'asc' } },
          reports: { orderBy: { reportNumber: 'asc' } },
          investigationLogs: { orderBy: { createdAt: 'desc' } },
          relationships: true
        }
      })
      if (!caseData) return reply.status(404).send({ error: 'Case not found' })
      return { data: caseData }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch case' })
    }
  })

  fastify.post('/', async (request, reply) => {
    const body = request.body as any
    try {
      const caseNumber = `CID-${Date.now().toString(36).toUpperCase()}`
      const newCase = await prisma.case.create({
        data: {
          caseNumber,
          title: body.title,
          description: body.description || '',
          type: body.type || 'investigation',
          status: body.status || 'open',
          classification: body.classification || 'CONFIDENTIAL',
          priority: body.priority || 'medium',
          location: body.location || '',
          date: body.date || new Date().toISOString().split('T')[0],
          time: body.time || new Date().toTimeString().slice(0, 5),
          reportingAgent: body.reportingAgent || 'Unknown',
          handler: body.handler,
          involvedAgents: body.involvedAgents ? JSON.stringify(body.involvedAgents) : null,
          teamMembers: body.teamMembers ? JSON.stringify(body.teamMembers) : null,
          actionsTaken: body.actionsTaken,
          recommendedNextStep: body.recommendedNextStep,
          createdBy: body.createdBy || 'system',
          phase: body.phase,
          riskLevel: body.riskLevel,
          budget: body.budget,
          duration: body.duration,
          tags: body.tags ? JSON.stringify(body.tags) : null,
          intelligenceValue: body.intelligenceValue,
          threatLevel: body.threatLevel,
          operationType: body.operationType,
          operationStatus: body.operationStatus
        },
        include: { suspects: true, victims: true, witnesses: true, evidences: true }
      })
      if (body.summary) {
        await prisma.caseReport.create({
          data: {
            caseId: newCase.id,
            reportType: 'initial',
            reportNumber: 1,
            title: `Initial Report - ${newCase.title}`,
            executiveSummary: body.summary,
            classification: body.classification || 'CONFIDENTIAL'
          }
        })
      }
      return { data: newCase }
    } catch (error) {
      console.error(error)
      reply.status(500).send({ error: 'Failed to create case' })
    }
  })

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as any
    try {
      const updated = await prisma.case.update({
        where: { id },
        data: {
          title: body.title,
          description: body.description,
          type: body.type,
          status: body.status,
          classification: body.classification,
          priority: body.priority,
          location: body.location,
          date: body.date,
          time: body.time,
          reportingAgent: body.reportingAgent,
          handler: body.handler,
          involvedAgents: body.involvedAgents ? JSON.stringify(body.involvedAgents) : undefined,
          teamMembers: body.teamMembers ? JSON.stringify(body.teamMembers) : undefined,
          actionsTaken: body.actionsTaken,
          recommendedNextStep: body.recommendedNextStep,
          phase: body.phase,
          riskLevel: body.riskLevel,
          budget: body.budget,
          duration: body.duration,
          tags: body.tags ? JSON.stringify(body.tags) : undefined,
          intelligenceValue: body.intelligenceValue,
          threatLevel: body.threatLevel,
          operationType: body.operationType,
          operationStatus: body.operationStatus,
          closedAt: body.status === 'closed' ? new Date() : undefined
        },
        include: { suspects: true, victims: true, witnesses: true, evidences: true, timelineEvents: true, reports: true }
      })
      return { data: updated }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update case' })
    }
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.case.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete case' })
    }
  })

  fastify.get('/:caseId/suspects', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const suspects = await prisma.suspect.findMany({ where: { caseId } })
      return { data: suspects }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch suspects' })
    }
  })

  fastify.post('/:caseId/suspects', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const suspect = await prisma.suspect.create({ data: { caseId, ...body } })
      return { data: suspect }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create suspect' })
    }
  })

  fastify.put('/suspects/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as any
    try {
      const suspect = await prisma.suspect.update({ where: { id }, data: body })
      return { data: suspect }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update suspect' })
    }
  })

  fastify.delete('/suspects/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.suspect.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete suspect' })
    }
  })

  fastify.get('/:caseId/victims', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const victims = await prisma.victim.findMany({ where: { caseId } })
      return { data: victims }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch victims' })
    }
  })

  fastify.post('/:caseId/victims', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const victim = await prisma.victim.create({ data: { caseId, ...body } })
      return { data: victim }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create victim' })
    }
  })

  fastify.delete('/victims/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.victim.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete victim' })
    }
  })

  fastify.get('/:caseId/witnesses', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const witnesses = await prisma.witness.findMany({ where: { caseId } })
      return { data: witnesses }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch witnesses' })
    }
  })

  fastify.post('/:caseId/witnesses', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const witness = await prisma.witness.create({ data: { caseId, ...body } })
      return { data: witness }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create witness' })
    }
  })

  fastify.delete('/witnesses/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.witness.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete witness' })
    }
  })

  fastify.get('/:caseId/timeline', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const events = await prisma.timelineEvent.findMany({ where: { caseId }, orderBy: { eventTime: 'asc' } })
      return { data: events }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch timeline' })
    }
  })

  fastify.post('/:caseId/timeline', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const event = await prisma.timelineEvent.create({ data: { caseId, ...body } })
      return { data: event }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create event' })
    }
  })

  fastify.delete('/timeline/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.timelineEvent.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete event' })
    }
  })

  fastify.get('/:caseId/logs', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const logs = await prisma.investigationLog.findMany({ where: { caseId }, orderBy: { createdAt: 'desc' } })
      return { data: logs }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch logs' })
    }
  })

  fastify.post('/:caseId/logs', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const log = await prisma.investigationLog.create({ data: { caseId, ...body } })
      return { data: log }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create log' })
    }
  })

  fastify.get('/:caseId/reports', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const reports = await prisma.caseReport.findMany({ where: { caseId }, orderBy: { reportNumber: 'asc' } })
      return { data: reports }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch reports' })
    }
  })

  fastify.post('/:caseId/reports', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    const body = request.body as any
    try {
      const count = await prisma.caseReport.count({ where: { caseId } })
      const report = await prisma.caseReport.create({ data: { caseId, reportNumber: count + 1, ...body } })
      return { data: report }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create report' })
    }
  })

  fastify.get('/:caseId/evidence', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const evidences = await prisma.evidence.findMany({ where: { caseId }, include: { weapon: true, car: true, imageEvidence: true, document: true } })
      return { data: evidences }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch evidence' })
    }
  })

  fastify.get('/:caseId/relationships', async (request, reply) => {
    const { caseId } = request.params as { caseId: string }
    try {
      const relationships = await prisma.relationship.findMany({ where: { caseId } })
      return { data: relationships }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch relationships' })
    }
  })

  fastify.post('/relationships', async (request, reply) => {
    const body = request.body as any
    try {
      const relationship = await prisma.relationship.create({ data: body })
      return { data: relationship }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create relationship' })
    }
  })

  fastify.delete('/relationships/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.relationship.delete({ where: { id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete relationship' })
    }
  })
}
