import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'

export async function graphRoutes(app: FastifyInstance) {

  /* =========================
     GET ALL BOARDS
  ========================= */
  
  app.get('/boards', async (req: any) => {
    const userId = req.headers['x-user-id'] || 'default'
    
    const boards = await prisma.board.findMany({
      where: {
        ownerId: userId
      },
      include: {
        _count: {
          select: { nodes: true, edges: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return boards.map(board => ({
      id: board.id,
      name: board.title,
      description: board.description,
      nodeCount: board._count.nodes,
      edgeCount: board._count.edges,
      createdAt: board.createdAt
    }))
  })

  /* =========================
     CREATE BOARD
  ========================= */
  
  app.post('/boards', async (req: any) => {
    const body = req.body
    const userId = req.headers['x-user-id'] || 'default'
    
    // Check limit - max 5 boards per user
    const boardCount = await prisma.board.count({
      where: { ownerId: userId }
    })
    
    if (boardCount >= 5) {
      return { error: 'Maximum 5 boards allowed per user' }
    }
    
    const board = await prisma.board.create({
      data: {
        title: body.name,
        description: body.description || '',
        ownerId: userId
      }
    })
    
    return {
      id: board.id,
      name: board.title,
      description: board.description,
      nodeCount: 0,
      edgeCount: 0,
      createdAt: board.createdAt
    }
  })

  /* =========================
     DELETE BOARD
  ========================= */
  
  app.delete('/boards/:id', async (req: any) => {
    const { id } = req.params
    
    // Don't allow deleting main-case
    if (id === 'main-case') {
      return { error: 'Cannot delete main case board' }
    }
    
    await prisma.graphEdge.deleteMany({ where: { boardId: id } })
    await prisma.graphNode.deleteMany({ where: { boardId: id } })
    await prisma.board.delete({ where: { id } })
    
    return { success: true }
  })

  /* =========================
     GET GRAPH
  ========================= */

  app.get('/graph/:boardId', async (req: any) => {
    const { boardId } = req.params
    
    // Handle 'main-case' as default board
    let actualBoardId = boardId
    if (boardId === 'main-case') {
      // Check if main-case exists, if not create it
      let mainBoard = await prisma.board.findFirst({
        where: { title: 'Main Investigation' }
      })
      
      if (!mainBoard) {
        mainBoard = await prisma.board.create({
          data: {
            title: 'Main Investigation',
            description: 'Primary case evidence network',
            ownerId: 'default'
          }
        })
      }
      actualBoardId = mainBoard.id
    }
    
    const nodes = await prisma.graphNode.findMany({
      where: { boardId: actualBoardId }
    })
    
    const edges = await prisma.graphEdge.findMany({
      where: { boardId: actualBoardId }
    })
    
    console.log('[API] Returning nodes:', nodes.length)
    nodes.forEach((node, i) => {
      console.log(`  Node ${i+1}: id=${node.id}, title=${node.title}, pos=(${node.x}, ${node.y}), type=${node.nodeType}`)
    })
    
    // Convert to React Flow format
    const reactNodes = nodes.map(node => ({
      id: node.id,
      type: 'evidenceNode',
      position: { x: node.x, y: node.y },
      data: {
        label: node.title,
        subtitle: node.subtitle || '',
        nodeType: node.nodeType,
        classification: node.classification
      }
    }))
    
    const reactEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed' as const }
    }))
    
    return {
      nodes: reactNodes,
      edges: reactEdges
    }
  })

  /* =========================
     CREATE NODE
  ========================= */
  
  app.post('/graph/node', async (req: any) => {
    const body = req.body
    const userId = req.headers['x-user-id'] || 'default'
    
    const node = await prisma.graphNode.create({
      data: {
        boardId: body.boardId,
        nodeType: body.nodeType,
        title: body.title,
        subtitle: body.subtitle || '',
        x: body.x || Math.random() * 400 + 100,
        y: body.y || Math.random() * 300 + 100,
        classification: body.classification || 'CONFIDENTIAL',
        createdBy: userId
      }
    })
    
    return {
      id: node.id,
      type: 'evidenceNode',
      position: { x: node.x, y: node.y },
      data: {
        label: node.title,
        subtitle: node.subtitle || '',
        nodeType: node.nodeType,
        classification: node.classification
      }
    }
  })

  /* =========================
     UPDATE NODE
  ========================= */
  
  app.put('/graph/node/:id', async (req: any) => {
    const { id } = req.params
    const body = req.body
    
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle
    if (body.nodeType !== undefined) updateData.nodeType = body.nodeType
    if (body.classification !== undefined) updateData.classification = body.classification
    if (body.x !== undefined) updateData.x = body.x
    if (body.y !== undefined) updateData.y = body.y
    
    const node = await prisma.graphNode.update({
      where: { id },
      data: updateData
    })
    
    return {
      id: node.id,
      type: 'evidenceNode',
      position: { x: node.x, y: node.y },
      data: {
        label: node.title,
        subtitle: node.subtitle || '',
        nodeType: node.nodeType,
        classification: node.classification
      }
    }
  })

  /* =========================
     DELETE NODE
  ========================= */
  
  app.delete('/graph/node/:id', async (req: any) => {
    const { id } = req.params
    
    // Delete connected edges first
    await prisma.graphEdge.deleteMany({
      where: {
        OR: [{ source: id }, { target: id }]
      }
    })
    
    await prisma.graphNode.delete({ where: { id } })
    
    return { success: true }
  })

  /* =========================
     CREATE EDGE
  ========================= */
  
  app.post('/graph/edge', async (req: any) => {
    const body = req.body
    
    const edge = await prisma.graphEdge.create({
      data: {
        boardId: body.boardId,
        source: body.source,
        target: body.target,
        label: body.label || '',
        animated: body.animated !== false
      }
    })
    
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed' as const }
    }
  })

  /* =========================
     UPDATE EDGE
  ========================= */
  
  app.put('/graph/edge/:id', async (req: any) => {
    const { id } = req.params
    const body = req.body
    
    const edge = await prisma.graphEdge.update({
      where: { id },
      data: {
        label: body.label
      }
    })
    
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: edge.animated
    }
  })

  /* =========================
     DELETE EDGE
  ========================= */
  
  app.delete('/graph/edge/:id', async (req: any) => {
    const { id } = req.params
    
    await prisma.graphEdge.delete({ where: { id } })
    
    return { success: true }
  })

  /* =========================
     UPDATE NODES POSITIONS (BATCH)
  ========================= */
  
  app.post('/graph/nodes/positions', async (req: any) => {
    const body = req.body
    const { nodes } = body
    
    // Update all positions in a transaction
    await prisma.$transaction(
      nodes.map((node: any) => 
        prisma.graphNode.update({
          where: { id: node.id },
          data: { x: node.x, y: node.y }
        })
      )
    )
    
    return { success: true }
  })
}
