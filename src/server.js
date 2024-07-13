/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CLOSE_DB, CONNECT_DB } from '~/config/mongodb'
import { APIs_V1 } from './routes/v1'

const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.use(express.json())

  app.use('/v1', APIs_V1)

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Hello Thong, I am running at ${ hostname }:${ port }/`)
  })

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

// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
