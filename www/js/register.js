const { link_code, email_code, api_url } = getMeta();

// Show the loading page immediately.
showHide('loading', true);

// Is the user clicking the link in their email?
if (email_code != undefined) {
    // Forward the relevant data to the API.
    fetch(`${api_url}/v1/link/${link_code}/${email_code}`)
        .then(checkErrors)                      // Check to see if there's any errors.
        .catch(handleError)
        .finally(showHide('loading', false));
} else {
    // Load the JSON from the API.
    fetch(`${api_url}/v1/link/${link_code}`)
        .then(checkErrors)                      // Check to see if there's any errors.
        .then((response) => response.json())    // Convert our error free response to json.
        .then((player_data) => {                // Process our player data.
            player_data['profile'] = `https://crafthead.net/avatar/${player_data.uuid}/180`;
            writePlayerData(player_data);
            showHide('loading', false);
        })
        .catch(handleError);                    // There's an error. Dump it to the error page.
}


// Send the data from the form to the API.
async function submitForm() {
    // Show the loading page.
    showHide('loading', true);

    // Gather the data the user entered into the form.
    let player_data = {};
    document.querySelectorAll("form [data-player]").forEach(e => {
        player_data[e.dataset.player] = e.value;
    });

    // Create the parameters for our request to the API.
    const params = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player_data)
    };

    // Make a request to the API using our params.
    fetch(`${api_url}/v1/link/${link_code}`, params)
        .then(handleInputError)     // Show any issues with the data the player entered.
        .then(checkErrors)          // Check to see if there's any errors.    
        .then(() => {               // Show the email sent page.
            document.getElementById("email-sent").removeAttribute("hidden");
        })
        .then(showHide('loading', false))
        .catch(handleError)         // There's an error. Dump it to the error page.
}

// Listen for click on the button and run submitForm().
document.querySelector("button").addEventListener('click', submitForm);




// ########################################
//                Promises
// ########################################

// Convert any HTTP errors into exceptions.
async function checkErrors(resp) {
    if (!resp.ok && resp.status != 422) {
        throw { status: resp.status, statusText: resp.statusText, body: await resp.text() }
    }
    return resp;
}

// Capture any exceptions and show a suitable error page.
function handleError(error) {
    // Error page for pre-defined http codes.
    let error_page = document.getElementById('error-' + error.status);

    // If no pre-defined http error pages exist... make our own.
    if (error_page == null) {
        error_page = document.getElementById('error');

        // Error page for our custom HTTP errors.
        if (error.status && error.statusText && error.body) {
            error_page.querySelector("h3").innerText = `${error.status} - ${error.statusText}`;
            error_page.querySelector("p").innerText = `${error.body}`;
        }

        // Error page for generic errors. Put the juicy deets in the console.
        else {
            error_page.querySelector("h3").innerText = "Something went wrong.";
            console.error(error);
        }
    }

    // Show the error page to the world!
    error_page.removeAttribute("hidden");
}

// If the server think's the user's data is invalid, we need to update the form to reflect the issues.
async function handleInputError(resp) {
    if (resp.status == '422') {
        // Parse the json the API sent us.
        const errors = await resp.json();

        // Remove the invalid class from the input's parent element and remove the
        // text inside our sibling element with the error class.
        e.parentElement.classList.remove("invalid")
        e.parentElement.querySelector(".error").innerText = ""

        // foreach element with data-player attributes with a form as a parent...
        document.querySelectorAll("form [data-player]").forEach(e => {

            // If a message exists for this attribute value...
            let msg = errors[e.dataset.player];
            if (msg != undefined && msg != "") {
                // Add the invalid class to the input's parent element and set the
                // text inside our sibling element with the error class to the error
                // message.
                e.parentElement.classList.add("invalid");
                e.parentElement.querySelector(".error").innerText = msg;
            }
        })
    }
    return resp;
}




// ########################################
//                Helpers
// ########################################

// Write the player's data to all elements with the corresponding data-player attribute.
async function writePlayerData(player) {
    document.querySelectorAll("[data-player]").forEach(element => {
        // Set the appropriate attribute for the different tags we will be working with.
        switch (element.tagName) {
            case 'IMG':             // set src for img tags.
                element.src = player[element.dataset.player];
                break;
            case 'INPUT':           // set value for input fields.
                element.value = player[element.dataset.player];
                break;
            default:                // set innerText for everything else.
                element.innerText = player[element.dataset.player];
                break;
        }
    })
}

// Show or hide an element with specified ID.
function showHide(id, show) {
    if (show != true) {
        
        // Delay showing the loading screen by half a second to let the browser catch up (slow device).
        if (id == 'loading')
            setTimeout(() => { document.getElementById(id).setAttribute("hidden", "") }, 500);
        else
            document.getElementById(id).setAttribute("hidden", "");
    }
    else {
        document.getElementById(id).removeAttribute("hidden");
    }
}

// Get the email and link codes from the meta tags of the document.
function getMeta() {
    // Get and set the link code if it exists.
    let link_code = undefined;
    const link_code_meta = document.querySelector('meta[data-link-code]');
    if (link_code_meta != null)
        link_code = link_code_meta.dataset.linkCode;

    // Get and set the email code if it exists.
    let email_code = undefined;
    const email_code_meta = document.querySelector('meta[data-email-code]');
    if (email_code_meta != null)
        email_code = email_code_meta.dataset.emailCode;

    // Get and set the api_url if it exists.
    let api_url = undefined;
    const api_url_meta = document.querySelector('meta[data-api-url]');
    if (api_url_meta != null)
        api_url = api_url_meta.dataset.apiUrl;

    // Log the meta because why the frick not.
    console.log("link_code:     " + link_code);
    console.log("email_code:    " + email_code);
    console.log("api_url:       " + api_url);

    // Return the meta.
    return { link_code, email_code, api_url }
}