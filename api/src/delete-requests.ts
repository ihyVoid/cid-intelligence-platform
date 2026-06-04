import { FastifyInstance } from 'fastify'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

// Create default owner user on startup
async function createDefaultUsers() {
  try {
    const existingOwner = await prisma.user.findUnique({
      where: { username: 'ihyVoid' }
    })
    
    if (!existingOwner) {
      const hashedPassword = await bcrypt.hash('barbod.1384', 10)
      await prisma.user.create({
        data: {
          username: 'ihyVoid',
          password: hashedPassword,
          role: 'owner'
        }
      })
      console.log('[API] Default owner user created: ihyVoid')
    }
    
    // Create admin if not exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      })
      console.log('[API] Default admin user created: admin')
    }
  } catch (error) {
    console.error('[API] Error creating default users:', error)
  }
}

export async function deleteRequestRoutes(app: FastifyInstance) {
  // Create default users on startup
  createDefaultUsers()

  // Create delete request
  app.post('/delete-requests', async (request, reply) => {
    const body = request.body as any
    try {
      const deleteRequest = await prisma.deleteRequest.create({
        data: {
          entityType: body.entityType,
          entityId: body.entityId,
          reason: body.reason,
          requestedBy: body.requestedBy || 'admin',
          status: 'PENDING'
        }
      })
      return { data: deleteRequest }
    } catch (error: any) {
      console.error('Error creating delete request:', error)
      reply.status(500).send({ error: error.message || 'Failed to create delete request' })
    }
  })

  // Get all pending delete requests
  app.get('/delete-requests', async () => {
    try {
      const requests = await prisma.deleteRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
      })
      return { data: requests }
    } catch (error) {
      return { data: [] }
    }
  })

  // Get all delete requests (for admin)
  app.get('/delete-requests/all', async () => {
    try {
      const requests = await prisma.deleteRequest.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return { data: requests }
    } catch (error) {
      return { data: [] }
    }
  })

  // Approve delete request
  app.post('/delete-requests/:id/approve', async (request, reply) => {
    const params = request.params as any
    const body = request.body as any
    try {
      // Update request status
      const deleteRequest = await prisma.deleteRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          reviewedBy: body.reviewedBy || 'admin',
          reviewedAt: new Date()
        }
      })

      // Delete the entity based on type
      if (deleteRequest.entityType === 'case') {
        // Delete case and all related data
        await prisma.relationship.deleteMany({ where: { caseId: deleteRequest.entityId } })
        await prisma.timelineEvent.deleteMany({ where: { caseId: deleteRequest.entityId } })
        await prisma.investigationLog.deleteMany({ where: { caseId: deleteRequest.entityId } })
        await prisma.caseReport.deleteMany({ where: { caseId: deleteRequest.entityId } })
        
        // Get all suspects, victims, witnesses for this case
        const suspects = await prisma.suspect.findMany({ where: { caseId: deleteRequest.entityId } })
        const victims = await prisma.victim.findMany({ where: { caseId: deleteRequest.entityId } })
        const witnesses = await prisma.witness.findMany({ where: { caseId: deleteRequest.entityId } })
        
        // Delete evidence and related records
        const evidences = await prisma.evidence.findMany({ where: { caseId: deleteRequest.entityId } })
        for (const evidence of evidences) {
          await prisma.weaponEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.carEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.imageEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.documentEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.evidenceRelationship.deleteMany({ 
            where: { 
              OR: [{ sourceEvidenceId: evidence.id }, { targetEvidenceId: evidence.id }] 
            } 
          })
          await prisma.evidence.delete({ where: { id: evidence.id } })
        }
        
        // Delete suspects, victims, witnesses
        for (const s of suspects) await prisma.suspect.delete({ where: { id: s.id } })
        for (const v of victims) await prisma.victim.delete({ where: { id: v.id } })
        for (const w of witnesses) await prisma.witness.delete({ where: { id: w.id } })
        
        // Delete case
        await prisma.case.delete({ where: { id: deleteRequest.entityId } })
      } else if (deleteRequest.entityType === 'evidence') {
        const evidence = await prisma.evidence.findUnique({ where: { id: deleteRequest.entityId } })
        if (evidence) {
          await prisma.weaponEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.carEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.imageEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.documentEvidence.deleteMany({ where: { evidenceId: evidence.id } })
          await prisma.evidenceRelationship.deleteMany({ 
            where: { 
              OR: [{ sourceEvidenceId: evidence.id }, { targetEvidenceId: evidence.id }] 
            } 
          })
          await prisma.evidence.delete({ where: { id: evidence.id } })
        }
      }

      return { data: deleteRequest, success: true }
    } catch (error: any) {
      console.error('Error approving delete request:', error)
      reply.status(500).send({ error: error.message || 'Failed to approve delete request' })
    }
  })

  // Reject delete request
  app.post('/delete-requests/:id/reject', async (request, reply) => {
    const params = request.params as any
    const body = request.body as any
    try {
      const deleteRequest = await prisma.deleteRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          reviewedBy: body.reviewedBy || 'admin',
          reviewedAt: new Date()
        }
      })
      return { data: deleteRequest }
    } catch (error: any) {
      console.error('Error rejecting delete request:', error)
      reply.status(500).send({ error: error.message || 'Failed to reject delete request' })
    }
  })

  // Delete delete request (cancel)
  app.delete('/delete-requests/:id', async (request, reply) => {
    const params = request.params as any
    try {
      await prisma.deleteRequest.delete({ where: { id: params.id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete delete request' })
    }
  })
}