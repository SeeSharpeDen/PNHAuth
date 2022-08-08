const players = require("./players");
const link = require("./link");

// Only allows access when the correct API_KEY was sent.
function checkKey(req, res, next) {

    // Make sure that the Authorization is the same as the API_KEY
    if(req.get("Authorization") !== process.env.API_KEY) {
        return res.status(403).send("Invalid api key");
    }
    next();
}

module.exports = app => {
    // Require an API key for access to the players endpoint.
    app.use('/v1/players', checkKey, players)

    // Authentication is in the link_code so no checkKey middleware.
    app.use('/v1/link', link)
};