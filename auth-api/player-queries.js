const Uuid = require('uuid');
const { pool } = require("./database");

var randomstring = require('randomstring');

// Get all players.
const getPlayers = async (request, response) => {
    const { rows } = await pool.query('SELECT * FROM players')
    response.json(rows);
}

// Gets a player with a particular uuid.
const getPlayerByUuid = async (request, response) => {

    // Make sure the UUID is valid.
    if (!Uuid.validate(request.params.uuid)) {
        response.status(404).send("No player found.");
        return;
    }

    // Get the player from the database.
    pool.query("SELECT * FROM players WHERE uuid = $1",
        [request.params.uuid]).then(result => {
            if (result.rowCount < 1)
                response.status(404).send("No player found.");
            else
                response.json(result.rows[0]);
        }).catch(reason => {
            response.status(500).send(reason);
            return;
        })
}

const postPlayer = async (request, response) => {
    // TODO: Check if uuid exists on mojang's API (https://sessionserver.mojang.com/session/minecraft/profile/4566e69fc90748ee8d71d7ba5aa00d20)
    const uuid = request.body.uuid;
    const username = request.body.username;
    const link_code = randomstring.generate(8);

    // Verify that the username and uuid exist.
    if (!request.body || !uuid || !username || !Uuid.validate(uuid)) {
        response.status(400).send();
        return
    }


    pool.query("INSERT INTO players (uuid, username, link_code) VALUES ($1, $2, $3)", [uuid, username, link_code])
        .then(result => {
            if (result.rowCount < 1)
                response.status(500).send("Nothing was added");
            else
                response.status(201).json({
                    link_code: link_code,
                    link_url: `${process.env.LINK_ROOT}/${link_code}`,
                    url: `${process.env.API_ROOT}/v1/players/${uuid}`
                })
        }).catch(reason => {
            if(reason.code == "23505")
                response.status(409).send("That uuid already exists.");
            else
                response.status(500).send();
        });
}


module.exports = {
    getPlayers,
    getPlayerByUuid,
    postPlayer,
}