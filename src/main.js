import express, { response } from 'express'
import mariadb from "mariadb";
import { loadEnvFile } from 'node:process'

loadEnvFile('./.env');

const app = express();
const appPort = 3000

const connectionPool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.CONNECTION_LIMIT_AMOUNT
});

let connection;

async function getPokemonUnobtained() {
    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0");
        connection.end();
        return rows;
    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

async function getPokemonUnobtainedByName(name) {
    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0 AND pokemon_name='${name}'`);
        connection.end();
        return rows;
    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

async function countPokemonByType() {

    const countType = []

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM type");

        rows.forEach(element => {
            countType.push({
                'id': element.type_id,
                'name': element.type_name,
                'count': 0
            })
        });

    }
    catch (error) {
        console.log(error);
        connection.end();
    }

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0");

        rows.forEach(element => {
            countType[element.pokemon_type_1 - 1].count++;

            if (element.pokemon_type_2) {
                countType[element.pokemon_type_2 - 1].count++
            }
        });

        connection.end();
        return countType;

    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

async function countPokemonByTypeWithoutDLC() {

    const countType = []

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM type");

        rows.forEach(element => {
            countType.push({
                'id': element.type_id,
                'name': element.type_name,
                'count': 0
            })
        });

    }
    catch (error) {
        console.log(error);
        connection.end();
    }

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0 AND pokemon_id < 231");

        rows.forEach(element => {
            countType[element.pokemon_type_1 - 1].count++;

            if (element.pokemon_type_2) {
                countType[element.pokemon_type_2 - 1].count++
            }
        });

        connection.end();
        return countType;

    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

app.get('/unobtained', async (req, res) => {

    const pokemon = await getPokemonUnobtained()

    res.send(pokemon)
})

app.get('/unobtained/pokemon/:name', async (req, res) => {

    const pokemon = await getPokemonUnobtainedByName(req.params.name)

    res.send(pokemon)
})

app.get('/unobtained/count', async (req, res) => {

    const pokemon = await countPokemonByTypeWithoutDLC()

    res.send(pokemon) 
})

app.get('/unobtained/count/dlc', async (req, res) => {

    const pokemon = await countPokemonByType()

    res.send(pokemon)
})

app.listen(appPort, () => {
    console.log(`app launched on port ${appPort}`);
})
