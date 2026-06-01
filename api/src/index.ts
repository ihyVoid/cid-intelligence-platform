import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { userRoutes } from './users'
import { caseRoutes } from './cases'
import { evidenceRoutes } from './evidence'
import { graphRoutes } from './graph'

const app = Fastify({ logger: true })

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
})
app.register(userRoutes)
app.register(evidenceRoutes)
app.register(jwt, {
  secret: 'super-secret-key'
})
app.register(graphRoutes)
app.register(caseRoutes, {
  prefix: '/cases'
})
app.get('/', async () => {
  return {
    status: 'CID API ONLINE'
  }
})


app.listen({
  port: 4000
})