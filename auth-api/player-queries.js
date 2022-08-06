const { Pool } = require('pg')
const pool = new Pool()

const Uuid = require('uuid');

const { response } = require('express')
const { request } = require("http")
const emailValidator = require('email-validator')
var randomstring = require('randomstring');

// Get all players.
const getPlayers = (request, response) => {
    pool.query('SELECT * from players', (error, results) => {
        if (error)
            throw error
        response.status(200).json(results.rows)
    })
}

// Gets a player with a particular version.
const getPlayerByUuid = (request, response) => {
    if (Uuid.validate(request.params.uuid)) {
        pool.query('SELECT * FROM players WHERE uuid = $1', [request.params.uuid], (error, results) => {
            if (error)
                throw error
            if (results.rowCount > 0) {
                response.status(200).json(results.rows[0])
                return;
            }
        })
    } else
        response.status(404).send("No player found.")
}
// This function is stupid!
// Use this instead https://www.geeksforgeeks.org/how-to-chain-asynchronous-functions-in-javascript/
// Consume a link code to apply the user's details.
const postLink = (request, response) => {
    // Shorten the variable names to make the code cleaner.
    const name = request.body.name;
    const email = request.body.email;
    const guilded_username = request.body.guilded_username;
    const link_code = request.params.link_code;

    // Bail out if any of the required params don't exist.
    if (!request.body || !name || !email) {
        response.status(400).send("Invalid Request");
        return
    }

    // Validate the user's input.
    const errorData = {}

    if (name.length < 5)
        errorData["name"] = "Please enter your full name."
    if (!emailValidator.validate(email))
        errorData["email"] = "Please enter a valid email address."
    if (guilded_username && guilded_username.length < 5)
        errorData["guilded_username"] = "Please enter a valid guilded username (optional)."

    // If there's any errors with the user's data exist. Send the errors back in a 422.
    if (Object.keys(errorData).length > 0) {
        response.status(422).json(errorData)
        return
    }

    var uuid = null;

    // Firstly get the UUID for this link.
    pool.query("SELECT uuid from links where code = $1", [link_code], (error, results) => {
        if (error)
            throw error
        uuid = result.rows[0];
    })

    // If no link exists, just exit out now.
    if (uuid === null) {
        response.status(404).send("Link not found.");
        return;
    }

    // Apply the new information the the player.
    pool.query("update players set name = $1, guilded_username = $2, email = $3 where uuid = $4", [name, email, guilded_username, uuid], (error, results) => {
        if (error)
            throw error

        // If no rows where updated something went really wrong.
        if (results.rowCount == 0)
            throw new Error("No player was updated from link. UUID: " + uuid);
        
            console.log("FIRST!");
        // Create the email code for our player and write it to the database.
    })
    console.log("TOO EARLY!??????!?!");
    // var email_code = randomstring.generate(32);
        // console.log(email + " -> " + email_code);
}


module.exports = {
    getPlayers,
    getPlayerByUuid,
    postLink
}