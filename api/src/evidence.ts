import { FastifyInstance } from 'fastify'
import { prisma } from './prisma'

export async function evidenceRoutes(app: FastifyInstance) {

  // Create evidence
  app.post('/evidence', async (request) => {
    const body = request.body as any
    const evidence = await prisma.evidence.create({
      data: {
        title: body.title,
        description: body.description,
        evidenceType: body.type || 'other',
        classification: body.classification || 'CONFIDENTIAL',
        createdBy: body.createdBy || 'admin',
        caseId: body.caseId
      }
    })

    // Create type-specific evidence
    if (body.type === 'weapon' && body.weaponType) {
      await prisma.weaponEvidence.create({
        data: {
          evidenceId: evidence.id,
          weaponType: body.weaponType || 'rifle',
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
    } else if (body.type === 'car' && body.vehicleType) {
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
    }

    return { data: evidence }
  })

  // Get evidence by case
  app.get('/evidence/:caseId', async (request) => {
    const params = request.params as any
    const evidences = await prisma.evidence.findMany({
      where: { caseId: params.caseId },
      include: { weapon: true, car: true, imageEvidence: true, document: true }
    })
    return { data: evidences }
  })

  // Get all evidence by type
  app.get('/evidence/weapons', async () => {
    const weapons = await prisma.weaponEvidence.findMany({
      include: { evidence: true }
    })
    return { data: weapons }
  })

  app.get('/evidence/cars', async () => {
    const cars = await prisma.carEvidence.findMany({
      include: { evidence: true }
    })
    return { data: cars }
  })

  app.get('/evidence/images', async () => {
    const images = await prisma.imageEvidence.findMany({
      include: { evidence: true }
    })
    return { data: images }
  })

  app.get('/evidence/documents', async () => {
    const documents = await prisma.documentEvidence.findMany({
      include: { evidence: true }
    })
    return { data: documents }
  })

  // Delete evidence
  app.delete('/evidence/:id', async (request) => {
    const params = request.params as any
    await prisma.evidence.delete({ where: { id: params.id } })
    return { success: true }
  })
}
