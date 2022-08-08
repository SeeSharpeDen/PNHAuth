const Router = require('express-promise-router');
const db = require("../db");

const Uuid = require('uuid');
const randomstring = require('randomstring');

const router = new Router();
module.exports = router;

// Get all players.
router.get("/", async (req, res) => {
    const { rows } = await db.query(`SELECT uuid, username, guilded_username, verified, name, email, link_code, verified ,link_created < NOW() - INTERVAL '${process.env.LINK_TIMEOUT}' as code_expired FROM players`)
    res.json(rows);
});

router.get("/:uuid", async (req, res) => {
    // Make sure the UUID is valid.
    if (!Uuid.validate(req.params.uuid)) {
        res.status(404).send("No player found.");
        return;
    }

    // Get the player from the database.
    db.query(`SELECT uuid, username, verified, guilded_username, name, email, link_code as link,
            (link_created + INTERVAL '${process.env.LINK_TIMEOUT}') - NOW() as link_duration
        FROM players WHERE uuid = $1`,
        [req.params.uuid]).then(result => {
            if (result.rowCount < 1)
                res.status(404).send("No player found.");
            else {

                // Create a player.
                const player = result.rows[0];
                if (player.link_duration.milliseconds > 0) {
                    player.link = linkFromCode(player.link, player.link_duration);
                } else {
                    delete player.link;
                }
                delete player.link_duration;
                res.json(player);
            }
        })
});

// Create a new player with the provided uuid and username. Also make a link for them.
router.post("/", async (req, res) => {
    // TODO: Check if uuid exists on mojang's API (https://sessionserver.mojang.com/session/minecraft/profile/4566e69fc90748ee8d71d7ba5aa00d20)
    const uuid = req.body.uuid;
    const username = req.body.username;
    const link = generateLink();

    // Verify that the username and uuid exist.
    if (!req.body || !uuid || !username || !Uuid.validate(uuid)) {
        res.status(400).send();
        return
    }

    // Enter player details we have into the database and create a new link_code.
    db.query("INSERT INTO players (uuid, username, link_code, link_created) VALUES ($1, $2, $3, NOW())", [uuid, username, link.code])
        .then(result => {
            if (result.rowCount < 1)
                res.status(500).send("Nothing was added");
            else
                res.status(201).json({ player: `${process.env.API_ROOT}/v1/players/${uuid}`, link: link });
        }).catch(reason => {
            if (reason.code == "23505")
                res.status(409).send("That uuid already exists.");
            else
                res.status(500).send();
        });
});

// Get a new link for this user by overwriting the existing one.
router.get("/:uuid/new-link", async (req, res) => {
    const uuid = req.params.uuid;
    const link = generateLink();

    db.query("UPDATE players SET link_code=$1, link_created=NOW() WHERE uuid=$2", [link.code, uuid])
        .then(result => {
            if (result.rowCount < 1)
                res.status(404).send("No player found.");
            else
                res.status(201).json({ link: link })
        });
})

// Generate a link_code
function generateLink() {
    const code = randomstring.generate({
        readable: true,
        capitalization: 'lowercase',
        length: 6
    });
    return linkFromCode(code, process.env.LINK_TIMEOUT);
};

function linkFromCode(link_code, duration) {
    // If we got not link code, return nothing.
    if (link_code == null)
        return null

    // If the duration is an object prettyify it.
    if (typeof duration == 'object')
        duration = prettyDuration(duration);

    // Create our link object.
    return {
        code: link_code,
        duration: duration,
        public_url: `${process.env.LINK_ROOT}/${link_code}`,
        location: `${process.env.API_ROOT}/${link_code}`
    }
}

// Stringify a duration object and do some rounding while we're at it.
function prettyDuration(duration) {
    var str = "";

    // Round our seconds and minutes for a nicer string.
    if (duration.seconds >= 0 && duration.seconds < 45)
        duration.seconds = 30;
    else
        duration.minutes = duration.minutes + 1

    // Days.
    if (duration.days > 0)
        str = `${str} ${duration.days} days`

    // Hours.
    if (duration.hours > 0)
        str = `${str} ${duration.hours} hours`

    // Minutes.
    if (duration.minutes > 0)
        str = ` ${str} ${duration.minutes} minutes`

    // Seconds
    if (duration.seconds == 30)
        str = ` ${str} ${duration.seconds} seconds`

    return str.trimStart();
}