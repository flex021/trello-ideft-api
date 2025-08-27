/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from './config/cors.js'
import exitHook from 'async-exit-hook'
import { CLOSE_DB, CONNECT_DB } from './config/mongodb.js'
import { APIs_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import { env } from './config/environment.js'
import cookieParser from 'cookie-parser'
import SocketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket.js'
import path from 'path'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware)

  const server = http.createServer(app)

  const io = SocketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`3. LProduction: Hello Thong, I am running at port:${ process.env.PORT }/`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local DEV: Hello Thong, I am running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  exitHook(() => {
    console.log('4. close nè')
    CLOSE_DB()
    console.log('5. close nè')
  })
}

// chỉ khi kết nối database thành công thì mới start server back-end lên
(async () => {
  try {
    console.log('1. connecting to MongoDB Cloud Atlas')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

