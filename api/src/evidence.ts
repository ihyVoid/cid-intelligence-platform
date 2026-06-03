import { FastifyInstance } from 'fastify'
import { prisma } from './prisma'

export async function evidenceRoutes(app: FastifyInstance) {

  app.post('/evidence', async (request, reply) => {
    const body = request.body as any
    try {
      const evidenceType = body.evidenceType || body.type || 'other'
      
      const evidence = await prisma.evidence.create({
        data: {
          title: body.title,
          description: body.description,
          evidenceType: evidenceType,
          classification: body.classification || 'CONFIDENTIAL',
          createdBy: body.createdBy || 'admin',
          caseId: body.caseId || null
        }
      })

      // Create type-specific evidence based on the type field
      if (evidenceType === 'weapon') {
        await prisma.weaponEvidence.create({
          data: {
            evidenceId: evidence.id,
            weaponType: body.weaponType || 'other',
            serialNumber: body.serialNumber,
            condition: body.condition,
            caliber: body.caliber,
            brand: body.brand,
            model: body.model,
            seizedFrom: body.seizedFrom,
            seizureLocation: body.seizureLocation,
            seizureDate: body.seizureDate
          }
        })
      } else if (evidenceType === 'car') {
        await prisma.carEvidence.create({
          data: {
            evidenceId: evidence.id,
            vehicleType: body.vehicleType,
            make: body.make,
            model: body.model,
            year: body.year,
            plateNumber: body.plateNumber,
            color: body.color,
            vin: body.vin,
            seizedFrom: body.seizedFrom,
            seizureLocation: body.seizureLocation
          }
        })
      } else if (evidenceType === 'image') {
        await prisma.imageEvidence.create({
          data: {
            evidenceId: evidence.id,
            imageUrl: body.imageUrl || body.fileUrl,
            imageType: body.imageType,
            capturedAt: body.capturedAt,
            capturedBy: body.capturedBy,
            location: body.location,
            description: body.description
          }
        })
      } else if (evidenceType === 'document') {
        await prisma.documentEvidence.create({
          data: {
            evidenceId: evidence.id,
            documentType: body.documentType,
            fileUrl: body.fileUrl,
            fileSize: body.fileSize,
            mimeType: body.mimeType,
            pageCount: body.pageCount,
            language: body.language
          }
        })
      }

      return { data: evidence }
    } catch (error: any) {
      console.error('Error creating evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create evidence' })
    }
  })

  app.get('/evidence', async () => {
    const evidences = await prisma.evidence.findMany({
      include: { weapon: true, car: true, imageEvidence: true, document: true }
    })
    return { data: evidences }
  })

  app.get('/evidence/:id', async (request) => {
    const params = request.params as any
    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { weapon: true, car: true, imageEvidence: true, document: true }
    })
    return { data: evidence }
  })

  app.get('/evidence/weapons', async () => {
    try {
      const weapons = await prisma.weaponEvidence.findMany({
        include: { evidence: true }
      })
      return { data: weapons }
    } catch (error) {
      return { data: [] }
    }
  })

  app.get('/evidence/cars', async () => {
    try {
      const cars = await prisma.carEvidence.findMany({
        include: { evidence: true }
      })
      return { data: cars }
    } catch (error) {
      return { data: [] }
    }
  })

  app.get('/evidence/images', async () => {
    try {
      const images = await prisma.imageEvidence.findMany({
        include: { evidence: true }
      })
      return { data: images }
    } catch (error) {
      return { data: [] }
    }
  })

  app.get('/evidence/documents', async () => {
    try {
      const documents = await prisma.documentEvidence.findMany({
        include: { evidence: true }
      })
      return { data: documents }
    } catch (error) {
      return { data: [] }
    }
  })

  app.delete('/evidence/:id', async (request) => {
    const params = request.params as any
    await prisma.evidence.delete({ where: { id: params.id } })
    return { success: true }
  })
}
