const api_url = "http://localhost:33084"

// const link_code = document.querySelector('meta[data-link-code]').dataset.linkCode;
const link_code = document.location.hash.substring(1);


// Load the JSON from the API.
fetch(api_url + '/v1/link/' + link_code).then(
    async function (response) {
        // document.getElementById("raw-data").innerText = response.;
        if (!response.ok) {

            // Show the error screen.
            let error = document.getElementById("error" + response.status);
            if (error == null) {
                error = document.getElementById("error");
                error.querySelector("h2").innerText = `${response.status}`
                error.querySelector("p").innerText = `${await response.text()}`
            }

            error.removeAttribute("hidden");

            // Hide the loading screen.
            document.getElementById("loading").setAttribute("hidden", "");
            return;
        }

        // Get the player data from the json.
        let player_data = await response.json();

        // Set the player profile
        player_data["profile"] = "https://crafthead.net/avatar/" + player_data.uuid;

        // Set the player data.
        writePlayerData(player_data);
        document.getElementById("loading").setAttribute("hidden", "");
    }
).catch(function (reason) {
    throw reason
});

// Write the player's data to all elements with the data-player attribute.
function writePlayerData(player) {
    document.querySelectorAll("[data-player]").forEach(e => {
        switch (e.tagName) {
            case 'IMG':
                e.src = player[e.dataset.player];
                break;
            case 'INPUT':
                e.value = player[e.dataset.player];
                break;
            default:
                e.innerText = player[e.dataset.player];
                break;
        }
    })
}

// Write form errors to the form.
function writeFormErrors(errors) {
    document.querySelectorAll("form [data-player]").forEach(e => {
        e.parentElement.querySelector(".error").innerText = errors[e.dataset.error]
    })
}