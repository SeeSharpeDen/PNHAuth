# Index

<!-- TOC -->
- [How to run the API](#how-to-run-the-api)
- [Auth](#auth)
- [Player Object](#player-object)
- [Database](#database)
    - [Players](#players)
- [Endpoint](#endpoint)
    - [GET `/v1/player`](#get-v1player)
    - [GET `/v1/player/[Minecraft UUID]/`](#get-v1playerminecraft-uuid)
    - [POST `/v1/player/[Minecraft UUID]/`](#post-v1playerminecraft-uuid)
    - [GET `/v1/link/[Link Code]`](#get-v1linklink-code)
    - [POST `/v1/link/[Link Code]`](#post-v1linklink-code)
    - [GET `/v1/link/[Link Code]/[Email Code]`](#get-v1linklink-codeemail-code)
<!-- /TOC -->

## How to run the API
1. Clone this repo
2. `cd api`
3. Make a copy of the `template.env` file called `.env` in the `api` directory. Edit the contents of the file accordingly.
    > Remember to create a good random api key. you could run the `apg -m 128 -n 1` command to generate one 128 characters long.
4. run `npm install` to install all the dependences of this node project.
5. execute `node app.js` to execute the api. Alternatively you could use `nodemon` for automatic restarts while developing this API.

## Overview
Players/users become Authorized to update their details by requesting a temporary `link_code`. The link code could be provided by the plugin on the minecraft server or perhaps a moderator through a webpage.

### `/v1/players`
This is where player data is accessed and modified.

Access to any Player data is Authenticate and Authorized by matching the `API_KEY` environment variable (can be set in `.env`) with the contents of the client's `Authorization` header.


### `/v1/link`
This is where players can temporally access and modify their own data.

Players are Authenticated by the unique `link_code`. These expire after a pre-defined amount of time. We know what player has what code. Therefore players should keep this url/code secret, this cannot be guaranteed.


## Player Object
```json
{
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "username": "Notch",
    "guilded_username": null,
    "name": "Markus Persson",
	"email": null,
    "link_code": "jR4c56",
	"verified": 1659941569,
	"link_expired": true
}
```
- uuid
    > UUID of the minecraft player.
- username
    > The username of the minecraft player. (This is redundant due to uuid)
- guilded_username
    > The Guilded username that the player has.
- name
    > String,
    > The real name of the player.
- email
    > String,
    > The player's email address.
- verified
    > Timestamp,
    > When was the user verified, null for not.
- link_expired
    > True if the link has expired. false if not expired and null if there's no code.
- link_code
    > String,
    > The account link code (minecraft server > website auth)
- email_code
    > The code sent to the email address. The combination of link_code and email_code is used to create verify email url.

## Link Object
```json
{
    "code": "vp5r2q",
    "duration": "5 minutes",
    "public_url": "https://mc.pnh.net/link/vp5r2q",
}
```

- code
    > the code for this link.
- duration
    > the duration of time remaining before this link expires.
- public_url
    > the url a player would use to interact with their account.

## Database

### Players
Contains the [player objects](#player-object) data.
```sql
CREATE TABLE players (
	uuid uuid NOT NULL,
	username text NULL,
	guilded_username text NULL,
	"name" text NULL,
	email text NULL,
	link_code varchar NULL,
	email_code varchar NULL,
	link_created timestamp NULL,
	verified timestamp NULL,
	CONSTRAINT link_code UNIQUE (link_code),
	CONSTRAINT players_pkey PRIMARY KEY (uuid)
);
```

## Endpoint


### GET `/v1/player`
Gets all players in the database.

**403 Response**
> The Authorization header's data does not contain a matching API_KEY

**200 Response**
> Returns an array of [player objects](#player-object).
```json
[
    {
        "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
        "username": "Notch",
        "guilded_username": null,
        "name": "Markus Persson",
        "email": "Notch@mojang.com",
        "link_code": null,
        "verified": 1659941569,
        "code_expired": true
    },
    {
		"uuid": "7c529ba2-162f-11ed-861d-0242ac120002",
		"username": "jojo the awesome",
		"guilded_username": "gaben",
		"name": "Gabe Newel",
		"email": "gabe.newel@valve.com",
		"link_code": "gv9a44Ej",
		"code_expired": true,
		"verified": null
	}
]
```


### GET `/v1/player/[Minecraft UUID]/`
Gets a particular player from the database.

**`[Minecraft UUID]`**
> The UUID of the user to get.

**403 Response**
> The Authorization header's data does not contain a matching API_KEY

**404 Response**
> The provided `[Minecraft UUID]` doesn't match any players in the database or it's an incorrectly formatted uuid.

**200 Response**
> Returns a [player object](#player-object).
```json
{
	"uuid": "7c529ba2-162f-11ed-861d-0242ac120002",
	"username": "coolcat",
	"verified": null,
	"guilded_username": null,
	"name": "Mr Cool Cat",
	"email": "coolcat@gmail.com",
	"link": {
		"code": "vp5r2q",
		"duration": "4 minutes 30 seconds",
		"public_url": "https://example.com/link/vp5r2q",
	}
}
```


### GET `/v1/player/[Minecraft UUID]/new-link`
Creates a new link for a particular user.

**`[Minecraft UUID]`**
> The UUID of the user to create a new link for.

**403 Response**
> The Authorization header's data does not contain a matching API_KEY

**404 Response**
> The provided `[Minecraft UUID]` doesn't match any players in the database.

**200 Response**
> Returns a [link object](#link-object).
```json
{
	"link": {
		"code": "vp5r2q",
		"duration": "5 minutes",
		"public_url": "https://mc.pnh.net/link/vp5r2q",
		"location": "https://mc.pnh.net/api/vp5r2q"
	}
}
```


### POST `/v1/player/[Minecraft UUID]/`
Used to create a new player.

**`[Minecraft UUID]`**
> The UUID of the user to create.

**403 Response**
> The Authorization header's data does not contain a matching API_KEY

**409 Response**
> The provided `[Minecraft UUID]` already exists in the database.

**201 Response**
> Returns a link code for the newly entered player.
```json
{
    "link_code": "Pxym7N2zJRs",
    "link_url": "https://example.com/link/Pxym7N2zJRs",
    "url": "https://example.com/api/v1/player/069a79f4-44e9-4726-a5be-fca90e38aaf5"
}
```


### GET `/v1/link/[Link Code]`
Gets player details.

**`[Link Code]`**
> The link code.

**200 Response**
```json
{
	"uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
	"username": "Notch",
	"guilded_username": null,
	"name": "jojo the awesome",
	"email": "tom.parker1235@gmail.com",
	"verified": null,
}
```
**404 Response**
> The provided `[Link Code]` doesn't exist.

**410 Response**
> The provided `[Link Code]` has expired.


### POST `/v1/link/[Link Code]`
Updates player details and consumes the link code.

**`[Link Code]`**
> The link code to use for linking.

**Request:**
```http
Content-Type: application/json

{
    "name": "John Smith",
    "email": "smithers95@hotmail.com",
    "guilded_username": "xxX_Smithers94_Xxx"
}
```
`guilded_username` can be `null`

**404 Response**
> The provided `[Link Code]` doesn't exist.

**410 Response**
> The provided `[Link Code]` has expired.

**422 Response:**
> There's something wrong with the player's input. Each each element describes and issue with the input.
```json
{
    "email": "Email must be a valid email address."
}
```

### GET `/v1/link/[Link Code]/[Email Code]`
Verify's a user's email address.

**200 Response**
> The email has been verified. All good.

**404 Response**
> The provided `[Link Code]` and/or `[Email Code]` doesn't exist.