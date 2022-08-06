const player_form = document.querySelector("#player_form");
if (player_form) {

    player_form.addEventListener("submit", function (e) {

        submitForm(e, this);

    });

}

async function submitForm(e, form) {

    e.preventDefault();

    const btnSubmit = document.getElementById('btnSubmit');

    const json = JSON.stringify({
        'name': document.getElementById('name').value,
        'email': document.getElementById('email').value,
        'guilded_username': document.getElementById('guilded_username').value
    });

    

}


