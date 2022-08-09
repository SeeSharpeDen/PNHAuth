const api_url = "http://localhost:33084"

// const link_code = document.querySelector('meta[data-link-code]').dataset.linkCode;
const link_code = document.location.hash.substring(1);

async function checkErrors(resp) {
    if (!resp.ok && resp.status != 422) {
        throw { status: resp.status, statusText: resp.statusText, body: await resp.text() }
    }

    return resp;
}

// Load the JSON from the API.
fetch(api_url + '/v1/link/' + link_code)
    .then(checkErrors)
    .then((response) => response.json())
    .then((player_data) => {
        player_data['profile'] = `https://crafthead.net/avatar/${player_data.uuid}/180`;
        writePlayerData(player_data);
        loadingPage(false);
    })
    .catch(handleError)
// .finally(loadingPage(false))     this doesn't appear to work as expected.

const button = document.querySelector("button");
button.addEventListener('click', async function () {
    loadingPage(true);
    // Fill our data to send to the server.
    let data = {};
    document.querySelectorAll("form [data-player]").forEach(e => {
        data[e.dataset.player] = e.value;
    });

    // Send the data to the url.
    fetch(api_url + '/v1/link/' + link_code, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(handleInputError)
        .then(checkErrors)
        .then(() => {
            document.getElementById("email-sent").removeAttribute("hidden");
            loadingPage(false);
        })
        .catch(handleError)
    // .finally(loadingPage(false))     this doesn't appear to work as expected.
});

function loadingPage(show) {
    if (show != true)
        document.getElementById("loading").setAttribute("hidden", "");
    else
        document.getElementById("loading").removeAttribute("hidden");
}

async function handleInputError(resp) {
    if (resp.status == '422') {
        const errors = await resp.json();

        document.querySelectorAll("form [data-player]").forEach(e => {
            let msg = errors[e.dataset.player];
            if (msg != undefined && msg != "") {
                e.parentElement.querySelector(".error").innerText = errors[e.dataset.player]
                e.parentElement.classList.add("invalid")
            } else {
                e.parentElement.classList.remove("invalid")
                e.parentElement.querySelector(".error").innerText = ""
            }
        })
    }

    return resp;
}

function handleError(error) {
    // Error page for pre-defined http codes.
    let error_page = document.getElementById('error-' + error.status);

    if (error_page == null) {
        error_page = document.getElementById('error');

        // Error page for our custom HTTP errors.
        if (error.status && error.statusText && error.body) {
            error_page.querySelector("h3").innerText = `${error.status} - ${error.statusText}`;
            error_page.querySelector("p").innerText = `${error.body}`;

            // Error page for generic errors.
        } else {
            error_page.querySelector("h3").innerText = "That's Very Bad";
            error_page.querySelector("p").innerText = `${error}`;

            console.error(error);
        }
    }

    // Show the error.
    error_page.removeAttribute("hidden");
}

// Write the player's data to all elements with the data-player attribute.
async function writePlayerData(player) {
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