const Router = require('express-promise-router');
const db = require("../db");

const Uuid = require('uuid');
const randomstring = require('randomstring');

const router = new Router();
module.exports = router;

// Get all players.
router.get("/", async (req, res) => {
    const { rows } = await db.query("SELECT * FROM players")
    res.json(rows);
});

router.get("/:uuid", async (req, res) => {
    // Make sure the UUID is valid.
    if (!Uuid.validate(req.params.uuid)) {
        res.status(404).send("No player found.");
        return;
    }

    // Get the player from the database.
    db.query("SELECT * FROM players WHERE uuid = $1",
        [req.params.uuid]).then(result => {
            if (result.rowCount < 1)
                res.status(404).send("No player found.");
            else
                res.json(result.rows[0]);
        }).catch(reason => {
            res.status(500).send(reason);
            return;
        })
});

router.post("/", async (req, res) => {
    // TODO: Check if uuid exists on mojang's API (https://sessionserver.mojang.com/session/minecraft/profile/4566e69fc90748ee8d71d7ba5aa00d20)
    const uuid = req.body.uuid;
    const username = req.body.username;
    const link_code = randomstring.generate(8);

    // Verify that the username and uuid exist.
    if (!req.body || !uuid || !username || !Uuid.validate(uuid)) {
        res.status(400).send();
        return
    }


    db.query("INSERT INTO players (uuid, username, link_code) VALUES ($1, $2, $3)", [uuid, username, link_code])
        .then(result => {
            if (result.rowCount < 1)
                res.status(500).send("Nothing was added");
            else
                res.status(201).json({
                    link_code: link_code,
                    link_url: `${process.env.LINK_ROOT}/${link_code}`,
                    url: `${process.env.API_ROOT}/v1/players/${uuid}`
                })
        }).catch(reason => {
            if (reason.code == "23505")
                res.status(409).send("That uuid already exists.");
            else
                res.status(500).send();
        });
});