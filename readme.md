# Perth Nerd Horde Auth
This project consists of three distinct and separate components to assist with authenticating users for the Perth Nerd Horde minecraft server.

## API
The API is an express application for node.
API documentation can be found at [./api/readme.md](./api/readme.md).

## www
The public files for the application. This is just boring old HTML, CSS and JS. No frameworks no crap. Just works properly. It does require a small amount of server side includes however.


To get the www directory to function locally for development you'll need to host it as a server due to cross origin resource sharing rules. [this no BS guide](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server) is a good place.

**TL:DR:**
```sh
cd www
python3 -m http.server
```