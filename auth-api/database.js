const { Pool } = require('pg')

var pool = new Pool();


module.exports = {
    pool,
}