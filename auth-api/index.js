require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.json());
const players = require('./player-queries')
const link = require('./link-process')

app.get('/v1/players', players.getPlayers)
app.get('/v1/players/:uuid', players.getPlayerByUuid)
app.post('/v1/players', players.postPlayer)

app.post('/v1/link/:link_code', link.postLink)
app.get('/v1/link/:link_code/:email_code', link.verifyEmail);

start();

async function start() {
  await link.emailTransporter.verify().catch((e) => { throw e });

  app.listen(process.env.HTTP_PORT, () => {
    console.log(`PNH Auth. Listening on port ${process.env.HTTP_PORT}`)
  })
}