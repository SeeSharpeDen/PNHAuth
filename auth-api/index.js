require('dotenv').config()

const express = require('express')
const app = express()
const port = 3000

app.use(express.json());

const players = require('./player-queries')

app.get('/players', players.getPlayers)
app.get('/players/:uuid', players.getPlayerByUuid)
app.post('/link/:link_code', players.postLink)

app.listen(port, () => {
  console.log(`PNH Auth. Listening on port ${port}`)
})