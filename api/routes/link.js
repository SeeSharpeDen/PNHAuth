const Router = require('express-promise-router');
const db = require("../db");

const emailValidator = require('email-validator')
const nodemailer = require("nodemailer")
const randomstring = require('randomstring');
const e = require('express');

// Setup our router.
const router = new Router();
module.exports = router;

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
// Check to see if our emails will work.
emailTransporter.verify().catch((e) => { throw e });

// Get the user's information from a link.
router.get("/:link_code", async (req, res) => {
    const link_code = req.params.link_code;
    const { rows, rowCount } = await db.query(`SELECT uuid, username, guilded_username, verified, name, email, link_created < NOW() - INTERVAL '${process.env.LINK_TIMEOUT}' as expired FROM players WHERE link_code = $1`, [link_code]);

    // Nothing was fround matching that code.
    if (rowCount == 0)
        return res.status(404).send("Code not found.");

    // That the code has expired.
    if (rows[0].expired !== false)
        return res.status(410).send("Code has expired.");

    // Just return the things we want the player to know.
    res.status(200).json({
        uuid: rows[0].uuid,
        username: rows[0].username,
        name: rows[0].name,
        email: rows[0].email,
        verified: rows[0].verified,
        guilded_username: rows[0].guilded_username
    });
});

// Post the user's information from a link.
router.post("/:link_code", async (req, res) => {
    const link_code = req.params.link_code;

    const expired = await linkExpired(link_code);
    // exit with a 410 because the code expired.
    if (expired === true)
        return res.status(410).send("Code has expired.");
    // exit with 404 because the code wasn't found.
    else if (expired === null)
        return res.status(404).send("Code not found.");

    const data = {
        name: req.body.name,
        email: req.body.email,
        guilded_username: req.body.guilded_username
    }

    // Validate the player data. Exit out if it's invalid.
    const error = validateUserData(data);
    if (error !== true)
        return res.status(422).json(error)


    const email_code = randomstring.generate(32);
    const url = `${process.env.LINK_ROOT}/${link_code}/${email_code}`

    // Update the player's information in the database.
    const { rowCount } = await db.query(`UPDATE players
        SET
            name = $1,
            guilded_username = $2,
            email = $3,
            email_code = $4,
            verified = NOW(),
            link_created = null
        WHERE link_code = $5`,
        [data.name, data.guilded_username, data.email, email_code, link_code]
    );

    // Return a 404 because nothing was updated.
    if (rowCount == 0) {
        // TODO: Maybe throw an exception for this?
        console.warn(`Nothing was updated on link_code ${link_code}`);
        return res.status(500).send();
    }

    // Send the email.
    await sendEmail(data.email, url, data);

    res.status(201).send();
});

// Returns true if the link_code has expired, null if it's non existant.
async function linkExpired(link_code) {
    const { rowCount, rows } = await db.query(`SELECT link_created < NOW() - INTERVAL '${process.env.LINK_TIMEOUT}' as expired
        FROM players
        WHERE link_code = $1;`,
        [link_code]);
    if (rowCount > 0)
        return rows[0].expired === true;
    return null;
}

router.get("/:link_code/:email_code", async (req, res) => {
    const { rowCount } = await db.query(`UPDATE players
        SET
            link_code = null,
            email_code = null,
            verified = NOW()
        WHERE link_code = $1
        AND email_code = $2`,
        [req.params.link_code, req.params.email_code]
    );

    if (rowCount < 1)
        res.status(404).send()
    else {
        res.status(200).send();
        // The user has been authenticated. Tell the minecraft server about this.... How do we do that?.
    }
})

// Check to see if the user's data matches our rules. Return the data or false.
function validateUserData(data) {
    const error = {}

    console.log(data);

    // Check the existence and length of the name.
    if (data.name.length < 5)
        error["name"] = "Please enter your full name."

    // Check the existence and validity of the email.
    if (!emailValidator.validate(data.email))
        error["email"] = "Please enter a valid email address."

    // Check length of the guilded username if it exists.
    if (data.guilded_username != null && data.guilded_username.trim() != "" && data.guilded_username.length < 5)
        error["guilded_username"] = "Please enter a valid guilded username (optional)."

    // If there's any error. Send the errors back in a 422 response..
    if (Object.keys(error).length > 0) {
        return error
    }

    // Wooh! Nothing was invalid.
    return true
}

// Create and send the email.
async function sendEmail(address, url, playerData) {
    return await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: address,
        subject: 'Perth Nerd Horde - Minecraft Verification',
        html: `<h2>Perth Nerd Horde - Minecraft Verification</h2>
        <p>To verify your email address. Copy and paste into your browser or Click the link below.</p>
        <a href="${url}">${url}</a>`
    });
}