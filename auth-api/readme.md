# Player Object
```json
{
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "username": "Notch",
    "guilded-username": null,
    "name": "Markus Persson",
    "email": "Notch@mojang.com",
    "email_authed": false,
}
```
- uuid
    > UUID of the minecraft player.
- username
    > The username of the minecraft player. (This is redundant due to uuid)
- guilded-username
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


# Endponts

## GET `/v1/player`
Gets all players in the database.

## GET `/v1/player/[Minecraft UUID]/`
Gets a particular player from the database.

`[Minecraft UUID]`
> The UUID of the user to get.

## POST `/v1/player/[Minecraft UUID]/`
Used to create a new player.

`[Minecraft UUID]`
> The UUID of the user to create.