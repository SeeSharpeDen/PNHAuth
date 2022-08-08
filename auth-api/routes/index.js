const players = require("./players");
const link = require("./link");

module.exports = app => {
    app.use('/v1/players', players)
    app.use('/v1/link', link)
};