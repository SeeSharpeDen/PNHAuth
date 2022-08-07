"use strict";
const emailValidator = require('email-validator')
const nodemailer = require("nodemailer")
var randomstring = require('randomstring');
const { pool } = require("./database");
// Setup our emailing system.
let emailTransporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: process.env.NODEMAILER_SECURE,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

// This function is stupid!
// Use this instead https://www.geeksforgeeks.org/how-to-chain-asynchronous-functions-in-javascript/
// Consume a link code to apply the user's details.
const postLink = async (request, response) => {

    const link_code = request.params.link_code;
    // Validate the player data. Exit out if it's invalid.
    const data = validateUserData(request, response);
    if (data == false)
        return;

    const email_code = randomstring.generate(32);
    const url = `${process.env.LINK_ROOT}/${link_code}/${email_code}`

    // Update the player's information in the database.
    const { rowCount } = await pool.query(
        "UPDATE players SET name = $1, guilded_username = $2, email = $3, email_code = $4 WHERE link_code = $5",
        [data.name, data.email, data.guilded_username, email_code, link_code]
    );

    // Return a 404 because nothing was updated.
    if (rowCount == 0) {
        response.status(404).send();
        return;
    }

    // Generate our email
    await sendEmail(data.email, url, data);

    response.status(201).send("");
}

// Check to see if the user's data matches our rules. Return the data or false.
const validateUserData = (request, response) => {
    // Shorten the variable names to make the code cleaner.
    const name = request.body.name;
    const email = request.body.email;
    const guilded_username = request.body.guilded_username;

    // Bail out if no body was sent.
    if (!request.body) {
        response.status(400).send("Invalid Request");
        return false
    }

    // Create a variable for our error.
    const error = {}

    // Check the existence and length of the name.
    if (!name || name.length < 5)
        error["name"] = "Please enter your full name."

    // Check the existence and validity of the email.
    if (!email || !emailValidator.validate(email))
        error["email"] = "Please enter a valid email address."

    // Check length of the guilded username if it exists.
    if (guilded_username && guilded_username.length < 5)
        error["guilded_username"] = "Please enter a valid guilded username (optional)."

    // If there's any error. Send the errors back in a 422 response..
    if (Object.keys(error).length > 0) {
        response.status(422).json(error)
        return false
    }

    // Wooh! Nothing was invalid. Return the data.
    return { "name": name, "email": email, "guilded_username": guilded_username };
}
// Create and send the email.
const sendEmail = async (address, url, playerData) => await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: address,
    subject: 'Perth Nerd Horde - Minecraft Verification',
    html: `<h2>Perth Nerd Horde - Minecraft Verification</h2>
    <p>To verify your email address. Copy and paste into your browser or Click the link below.</p>
    <a href="${url}">${url}</a>`
});

const verifyEmail = async (request, response) => {
    const link_code = request.params.link_code;
    const email_code = request.params.email_code;

    if (!email_code || !link_code) {
        response.code(400).send();
        return;
    }

    const { rowCount } = await pool.query(
        "UPDATE players SET link_code = null, email_code = null, email_verified = true WHERE link_code = $1 AND email_code = $2",
        [link_code, email_code]
    );

    if (rowCount < 1)
        response.status(404).send()
    else {
        response.status(200).send();
        // The user has been authenticated. Tell the minecraft server about this.... How do we do that?.
    }
}

module.exports = {
    emailTransporter,
    postLink,
    pool,
    verifyEmail,
}