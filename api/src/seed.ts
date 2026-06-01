import { prisma } from './lib/prisma'

async function main() {

  const board = await prisma.board.create({

    data: {

      title: 'Operation Black Falcon',

      classification: 'TOP SECRET',

      ownerId: 'admin'

    }

  })

  await prisma.graphNode.create({

    data: {

      boardId: board.id,

      nodeType: 'operation',

      title: 'Operation Black Falcon',

      x: 500,
      y: 100

    }

  })

  await prisma.graphNode.create({

    data: {

      boardId: board.id,

      nodeType: 'suspect',

      title: 'Mamad Rebel',

      subtitle: 'HIGH PRIORITY TARGET',

      x: 250,
      y: 450

    }

  })

  await prisma.graphNode.create({

    data: {

      boardId: board.id,

      nodeType: 'evidence',

      title: 'AK-47 Shipment Photo',

      subtitle: 'FORENSIC IMAGE',

      x: 850,
      y: 450

    }

  })

  console.log('Board Created')
}

main()