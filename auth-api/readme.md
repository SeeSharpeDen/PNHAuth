# Index

<!-- TOC -->
- [Overview](#overview)
- [Player Object](#player-object)
- [Database](#database)
    - [Players](#players)
    - [Links](#links)
    - [Email Links](#email-links)
- [Endponts](#endponts)
    - [GET `/v1/player`](#get-v1player)
    - [GET `/v1/player/[Minecraft UUID]/`](#get-v1playerminecraft-uuid)
    - [POST `/v1/player/[Minecraft UUID]/`](#post-v1playerminecraft-uuid)
    - [POST `/v1/link/[Link Code]`](#post-v1linklink-code)
    - [GET `/v1/verify/[Email Code]`](#get-v1verifyemail-code)
<!-- /TOC -->

## Overview

When a player joins the Minecraft server a request is made to [GET `/v1/player/[Minecraft UUID]/`](#get-v1playerminecraft-uuid) by the plugin. The plugin will make permission changes based on the data retrieved from the api.

If the player's UUID doesn't already exist in the database one is added. A link code is generated. This link code is used to form a URL for the the player to go to. This is sent to the player via in-game chat messages. Once the player goes to the link url they are prompted to enter their details.

The website will send a request to [POST `/v1/link/[Link Code]`](#post-v1linklink-code) with the link code. This nodejs app will verify the player's details. If the details are good, we generate an unique url and email it to the player to verify their email.

Once the player eventually finds the email and clicks the link the [/v1/verify/[Email Code]`](#get-v1verifyemail-code) endpoint will be invoked. This triggers the plugin to make permission changes.

## Player Object
```json
{
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "username": "Notch",
    "guilded_username": null,
    "name": "Markus Persson",
    "email": "Notch@mojang.com",
    "email_authed": false,
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
- email_authed
    > Boolean,
    > Has the email address been authenticated?


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
	email_authed bool NULL,
	CONSTRAINT players_pkey PRIMARY KEY (uuid)
);
```

### Links
The map of active links. These are added and removed throughout the process of verifying players.
```sql
CREATE TABLE links (
	uuid uuid NOT NULL,
	code varchar NULL,
	CONSTRAINT links_fk FOREIGN KEY (uuid) REFERENCES players(uuid) ON DELETE CASCADE
);
CREATE UNIQUE INDEX links_code_idx ON public.links USING btree (code);
CREATE UNIQUE INDEX links_uuid_idx ON public.links USING btree (uuid);
```

### Email Links
The map of active email links. These are added and removed throughout the process of verifying player's email addresses.
```sql
CREATE TABLE email_links (
	uuid uuid NOT NULL,
	code varchar NOT NULL,
	CONSTRAINT email_links_fk FOREIGN KEY (uuid) REFERENCES players(uuid) ON DELETE CASCADE
);
CREATE UNIQUE INDEX email_links_code_idx ON public.email_links USING btree (code);
```


## Endponts

### GET `/v1/player`
Gets all players in the database.

**200 Response:**
> Returns an array of [player objects](#player-object).
```json
[
    {
        "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
        "username": "Notch",
        "guilded_username": null,
        "name": "Markus Persson",
        "email": "Notch@mojang.com",
        "email_authed": false,
    }
]
```


### GET `/v1/player/[Minecraft UUID]/`
Gets a particular player from the database.

**`[Minecraft UUID]`**
> The UUID of the user to get.

**200 Response:**
> Returns a [player object](#player-object).
```json
{
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "username": "Notch",
    "guilded_username": null,
    "name": "Markus Persson",
    "email": "Notch@mojang.com",
    "email_authed": false,
}
```


### POST `/v1/player/[Minecraft UUID]/`
Used to create a new player.

**`[Minecraft UUID]`**
> The UUID of the user to create.

**201 Response:**
> Returns a link code for the newly entered player.
```json
{
    "link_code": "Pxym7N2zJRs",
}
```


### POST `/v1/link/[Link Code]`
Updates player details and consumes the link code.

**`[Link Code]`**
> The link code to use for linking.

**body:**
```json
{
    "name": "John Smith",
    "email": "smithers95@hotmail.com",
    "guilded_username": "xxX_Smithers94_Xxx", // Can be null
}
```

**422 Response:**
> Returns a json object where each element represents an issue with the player's input.
```json
{
    "email": "Email must be a valid email address.",
    "name": "Please enter your full name.",
    "guilded_username": "Please enter a valid guilded username (optional)."
}
```


### GET `/v1/verify/[Email Code]`
Verify's a user's email address.

*NOT FINISHED*