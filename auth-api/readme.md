# players table
```sql
CREATE TABLE public.players
(
    uuid uuid NOT NULL,
    username text,
    guilded_username text,
    name text,
    email text,
    email_authed boolean,
    unique_code text,
    PRIMARY KEY (uuid)
);
```

# Player Object
```json
{
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "username": "Notch",
    "guilded_username": null,
    "name": "Markus Persson",
    "email": "Notch@mojang.com",
    "email_authed": false,
    "unique_code": "Pxym7N2zJRs_",
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
- unique_code
    > String,
    > The unique code of the user's authentication process.


# Endponts

## GET `/v1/player`
Gets all players in the database.

**200 Response:**
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
## GET `/v1/player/[Minecraft UUID]/`
Gets a particular player from the database.

`[Minecraft UUID]`
> The UUID of the user to get.

**200 Response:**
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

## POST `/v1/player/[Minecraft UUID]/`
Used to create a new player.

`[Minecraft UUID]`
> The UUID of the user to create.

**201 Response:**
```json
{
    "unique_code": "Pxym7N2zJRs",
}
```

## POST `/v1/link/[Link Code]`
Updates player details and consumes the link code.

**body:**
```json
{
    "name": "John Smith",
    "email": "smithers95@hotmail.com",
    "guilded_username": "xxX_Smithers94_Xxx", // Can be null
}
```

**422 Response:**
```json
{
    "email": "Email must be a valid email address.",
    "name": "Please enter your full name.",
    "guilded_username": "Please enter a valid guilded username (optional)."
}
```
## GET `/v1/verify/[Email Code]`
Verify's a user's email address.
