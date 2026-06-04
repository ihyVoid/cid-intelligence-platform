import { FastifyInstance } from 'fastify'
import { prisma } from './prisma'

export async function evidenceRoutes(app: FastifyInstance) {

  // Create weapon evidence
  app.post('/evidence/weapon', async (request, reply) => {
    const body = request.body as any
    try {
      const evidence = await prisma.evidence.create({
        data: {
          title: body.title,
          description: body.description || '',
          evidenceType: 'weapon',
          classification: body.classification || 'CONFIDENTIAL',
          createdBy: body.createdBy || 'admin',
          caseId: body.caseId || null
        }
      })

      const weapon = await prisma.weaponEvidence.create({
        data: {
          evidenceId: evidence.id,
          weaponType: body.weaponType || 'pistol',
          brand: body.brand,
          model: body.model,
          serialNumber: body.serialNumber,
          caliber: body.caliber,
          condition: body.condition,
          quality: body.quality,
          owner: body.owner,
          registeredOwner: body.registeredOwner,
          licenseStatus: body.licenseStatus,
          seizedFrom: body.seizedFrom,
          seizureLocation: body.seizureLocation,
          seizureDate: body.seizureDate,
          chainOfCustody: body.chainOfCustody,
          organ: body.organ || false,
          model3dType: body.weaponType || 'pistol'
        }
      })

      return { data: { ...evidence, weapon } }
    } catch (error: any) {
      console.error('Error creating weapon evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create weapon evidence' })
    }
  })

  // Create car evidence
  app.post('/evidence/car', async (request, reply) => {
    const body = request.body as any
    try {
      const evidence = await prisma.evidence.create({
        data: {
          title: body.title,
          description: body.description || '',
          evidenceType: 'car',
          classification: body.classification || 'CONFIDENTIAL',
          createdBy: body.createdBy || 'admin',
          caseId: body.caseId || null
        }
      })

      const car = await prisma.carEvidence.create({
        data: {
          evidenceId: evidence.id,
          vehicleType: body.vehicleType,
          make: body.make,
          model: body.model,
          year: body.year,
          trim: body.trim,
          plateNumber: body.plateNumber,
          plateState: body.plateState,
          vin: body.vin,
          color: body.color,
          interiorColor: body.interiorColor,
          bodyStyle: body.bodyStyle,
          owner: body.owner,
          registeredOwner: body.registeredOwner,
          insuranceStatus: body.insuranceStatus,
          condition: body.condition,
          mileage: body.mileage,
          damage: body.damage,
          seizedFrom: body.seizedFrom,
          seizureLocation: body.seizureLocation,
          seizureDate: body.seizureDate,
          model3dType: 'car'
        }
      })

      return { data: { ...evidence, car } }
    } catch (error: any) {
      console.error('Error creating car evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create car evidence' })
    }
  })

  // Create image evidence
  app.post('/evidence/image', async (request, reply) => {
    const body = request.body as any
    try {
      const evidence = await prisma.evidence.create({
        data: {
          title: body.title,
          description: body.description || '',
          evidenceType: 'image',
          classification: body.classification || 'CONFIDENTIAL',
          createdBy: body.createdBy || 'admin',
          caseId: body.caseId || null
        }
      })

      const image = await prisma.imageEvidence.create({
        data: {
          evidenceId: evidence.id,
          imageUrl: body.imageUrl,
          thumbnailUrl: body.thumbnailUrl,
          originalFilename: body.originalFilename,
          fileSize: body.fileSize,
          fileType: body.fileType,
          dimensions: body.dimensions,
          caption: body.caption,
          locationTaken: body.locationTaken,
          dateTaken: body.dateTaken,
          cameraModel: body.cameraModel,
          gpsCoordinates: body.gpsCoordinates,
          contentType: body.contentType,
          analysisNotes: body.analysisNotes
        }
      })

      return { data: { ...evidence, imageEvidence: image } }
    } catch (error: any) {
      console.error('Error creating image evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create image evidence' })
    }
  })

  // Create document evidence
  app.post('/evidence/document', async (request, reply) => {
    const body = request.body as any
    try {
      const evidence = await prisma.evidence.create({
        data: {
          title: body.title,
          description: body.description || '',
          evidenceType: 'document',
          classification: body.classification || 'CONFIDENTIAL',
          createdBy: body.createdBy || 'admin',
          caseId: body.caseId || null
        }
      })

      const doc = await prisma.documentEvidence.create({
        data: {
          evidenceId: evidence.id,
          documentType: body.documentType,
          title: body.docTitle,
          documentNumber: body.documentNumber,
          fileUrl: body.fileUrl,
          fileSize: body.fileSize,
          fileType: body.fileType,
          pages: body.pages,
          summary: body.summary,
          keyParties: body.keyParties,
          dateIssued: body.dateIssued,
          dateExpires: body.dateExpires,
          issuingAuthority: body.issuingAuthority,
          securityLevel: body.securityLevel,
          analysisNotes: body.analysisNotes
        }
      })

      return { data: { ...evidence, document: doc } }
    } catch (error: any) {
      console.error('Error creating document evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create document evidence' })
    }
  })

  // Legacy endpoint for backward compatibility
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
            caption: body.caption,
            locationTaken: body.locationTaken,
            dateTaken: body.dateTaken
          }
        })
      } else if (evidenceType === 'document') {
        await prisma.documentEvidence.create({
          data: {
            evidenceId: evidence.id,
            documentType: body.documentType,
            fileUrl: body.fileUrl,
            title: body.title
          }
        })
      }

      return { data: evidence }
    } catch (error: any) {
      console.error('Error creating evidence:', error)
      reply.status(500).send({ error: error.message || 'Failed to create evidence' })
    }
  })

  // Get all evidence
  app.get('/evidence', async () => {
    const evidences = await prisma.evidence.findMany({
      include: { weapon: true, car: true, imageEvidence: true, document: true },
      orderBy: { createdAt: 'desc' }
    })
    return { data: evidences }
  })

  // Get single evidence
  app.get('/evidence/:id', async (request) => {
    const params = request.params as any
    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { weapon: true, car: true, imageEvidence: true, document: true }
    })
    return { data: evidence }
  })

  // Get all weapons
  app.get('/evidence/weapons', async () => {
    try {
      const weapons = await prisma.weaponEvidence.findMany({
        include: { evidence: true },
        orderBy: { createdAt: 'desc' }
      })
      return { data: weapons }
    } catch (error) {
      return { data: [] }
    }
  })

  // Get single weapon
  app.get('/evidence/weapon/:id', async (request) => {
    const params = request.params as any
    const weapon = await prisma.weaponEvidence.findUnique({
      where: { id: params.id },
      include: { evidence: true }
    })
    return { data: weapon }
  })

  // Get all cars
  app.get('/evidence/cars', async () => {
    try {
      const cars = await prisma.carEvidence.findMany({
        include: { evidence: true },
        orderBy: { createdAt: 'desc' }
      })
      return { data: cars }
    } catch (error) {
      return { data: [] }
    }
  })

  // Get single car
  app.get('/evidence/car/:id', async (request) => {
    const params = request.params as any
    const car = await prisma.carEvidence.findUnique({
      where: { id: params.id },
      include: { evidence: true }
    })
    return { data: car }
  })

  // Get all images
  app.get('/evidence/images', async () => {
    try {
      const images = await prisma.imageEvidence.findMany({
        include: { evidence: true },
        orderBy: { createdAt: 'desc' }
      })
      return { data: images }
    } catch (error) {
      return { data: [] }
    }
  })

  // Get all documents
  app.get('/evidence/documents', async () => {
    try {
      const documents = await prisma.documentEvidence.findMany({
        include: { evidence: true },
        orderBy: { createdAt: 'desc' }
      })
      return { data: documents }
    } catch (error) {
      return { data: [] }
    }
  })

  // Delete evidence
  app.delete('/evidence/:id', async (request, reply) => {
    const params = request.params as any
    try {
      await prisma.evidence.delete({ where: { id: params.id } })
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete evidence' })
    }
  })

  // Delete weapon evidence
  app.delete('/evidence/weapon/:id', async (request, reply) => {
    const params = request.params as any
    try {
      const weapon = await prisma.weaponEvidence.findUnique({ where: { id: params.id } })
      if (weapon) {
        await prisma.weaponEvidence.delete({ where: { id: params.id } })
        await prisma.evidence.delete({ where: { id: weapon.evidenceId } })
      }
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete weapon evidence' })
    }
  })

  // Delete car evidence
  app.delete('/evidence/car/:id', async (request, reply) => {
    const params = request.params as any
    try {
      const car = await prisma.carEvidence.findUnique({ where: { id: params.id } })
      if (car) {
        await prisma.carEvidence.delete({ where: { id: params.id } })
        await prisma.evidence.delete({ where: { id: car.evidenceId } })
      }
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete car evidence' })
    }
  })

  // Delete image evidence
  app.delete('/evidence/image/:id', async (request, reply) => {
    const params = request.params as any
    try {
      const image = await prisma.imageEvidence.findUnique({ where: { id: params.id } })
      if (image) {
        await prisma.imageEvidence.delete({ where: { id: params.id } })
        await prisma.evidence.delete({ where: { id: image.evidenceId } })
      }
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete image evidence' })
    }
  })

  // Delete document evidence
  app.delete('/evidence/document/:id', async (request, reply) => {
    const params = request.params as any
    try {
      const doc = await prisma.documentEvidence.findUnique({ where: { id: params.id } })
      if (doc) {
        await prisma.documentEvidence.delete({ where: { id: params.id } })
        await prisma.evidence.delete({ where: { id: doc.evidenceId } })
      }
      return { success: true }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete document evidence' })
    }
  })

  // Update evidence
  app.put('/evidence/:id', async (request, reply) => {
    const params = request.params as any
    const body = request.body as any
    try {
      const evidence = await prisma.evidence.update({
        where: { id: params.id },
        data: {
          title: body.title,
          description: body.description,
          classification: body.classification
        }
      })
      return { data: evidence }
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update evidence' })
    }
  })
}
