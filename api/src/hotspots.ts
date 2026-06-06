import { FastifyInstance } from 'fastify'
import { prisma } from './prisma'

async function hotspotsRoutes(fastify: FastifyInstance) {
  // Get all hotspot templates
  fastify.get('/api/hotspots', async (request, reply) => {
    try {
      const templates = await prisma.hotspotTemplate.findMany()
      return templates.map(t => ({
        ...t,
        hotspots: JSON.parse(t.hotspots)
      }))
    } catch (error) {
      console.error('Error fetching hotspots:', error)
      reply.status(500).send({ error: 'Failed to fetch hotspots' })
    }
  })

  // Get hotspot template by model type
  fastify.get('/api/hotspots/:modelType', async (request, reply) => {
    const { modelType } = request.params as { modelType: string }
    
    try {
      const template = await prisma.hotspotTemplate.findUnique({
        where: { modelType }
      })
      
      if (template) {
        return {
          ...template,
          hotspots: JSON.parse(template.hotspots)
        }
      }
      
      // Return default hotspots if not found
      const defaultHotspots: Record<string, any[]> = {
        pistol: [
          { id: 'sn', label: 'Serial Number', labelKey: 'serialNumber', position: [-0.05, 0.15, 0.08] },
          { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.15, -0.05, 0.08] },
          { id: 'model', label: 'Model', labelKey: 'model', position: [0.05, 0.18, 0.08] },
        ],
        rifle: [
          { id: 'sn', label: 'Serial Number', labelKey: 'serialNumber', position: [-0.15, 0.15, 0.06] },
          { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.18, 0.02, 0.06] },
          { id: 'model', label: 'Model', labelKey: 'model', position: [0.08, 0.22, 0.06] },
        ],
        car: [
          { id: 'plate', label: 'Plate', labelKey: 'plateNumber', position: [0.05, 0.3, 0.6] },
          { id: 'model', label: 'Model', labelKey: 'model', position: [-0.2, 0.8, 0.2] },
          { id: 'color', label: 'Color', labelKey: 'color', position: [-0.8, 0.35, 0.05] },
          { id: 'owner', label: 'Owner', labelKey: 'owner', position: [0.25, 1.0, 0.08] },
        ],
        motorcycle: [
          { id: 'plate', label: 'Plate Number', labelKey: 'plateNumber', position: [-0.4, -0.1, 0.35] },
          { id: 'owner', label: 'Owner', labelKey: 'owner', position: [-0.45, -0.05, 0.1] },
          { id: 'color', label: 'Color', labelKey: 'color', position: [-0.45, -0.02, -0.01] },
          { id: 'model', label: 'Model', labelKey: 'model', position: [-0.48, 0.0, -0.15] },
        ],
      }
      
      return {
        modelType,
        hotspots: defaultHotspots[modelType] || defaultHotspots.car
      }
    } catch (error) {
      console.error('Error fetching hotspot:', error)
      reply.status(500).send({ error: 'Failed to fetch hotspot' })
    }
  })

  // Create or update hotspot template
  fastify.put('/api/hotspots/:modelType', async (request, reply) => {
    const { modelType } = request.params as { modelType: string }
    const { hotspots } = request.body as { hotspots: any[] }
    
    try {
      const template = await prisma.hotspotTemplate.upsert({
        where: { modelType },
        update: {
          hotspots: JSON.stringify(hotspots)
        },
        create: {
          modelType,
          hotspots: JSON.stringify(hotspots)
        }
      })
      
      return {
        ...template,
        hotspots: JSON.parse(template.hotspots)
      }
    } catch (error) {
      console.error('Error saving hotspot:', error)
      reply.status(500).send({ error: 'Failed to save hotspot' })
    }
  })

  // Delete hotspot template (reset to default)
  fastify.delete('/api/hotspots/:modelType', async (request, reply) => {
    const { modelType } = request.params as { modelType: string }
    
    try {
      await prisma.hotspotTemplate.delete({
        where: { modelType }
      })
      
      return { success: true, message: 'Hotspot template deleted' }
    } catch (error) {
      // Ignore if not found
      return { success: true, message: 'Hotspot template not found or deleted' }
    }
  })
}

export { hotspotsRoutes }