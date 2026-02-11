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

async function beautifulPokemonResult(list) {

    let listType = []

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query("SELECT * FROM type");
        connection.end();


        rows.forEach(element => {
            listType.push({
                'name': element.type_name
            })
        });

    }
    catch (error) {
        console.log(error);
        connection.end();
    }

    let pokemon = []

    list.forEach(element => {

        if (element.pokemon_type_2) {
            pokemon.push({
                'id': element.pokemon_id,
                'name': element.pokemon_name,
                'type1': listType[element.pokemon_type_1 - 1].name,
                'type2': listType[element.pokemon_type_2 - 1].name
            })
        } else {
            pokemon.push({
                'id': element.pokemon_id,
                'name': element.pokemon_name,
                'type1': listType[element.pokemon_type_1 - 1].name
            })
        }
    })

    return pokemon;
}

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

async function getPokemonUnobtainedByType(type) {

    let id = ""

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM type WHERE type_name = '${type}'`);
        connection.end();

        id = rows[0].type_id
    }
    catch (error) {
        console.log(error);
        connection.end();
    }

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0 AND (pokemon_type_1 = ${id} OR pokemon_type_2 = ${id})`);
        connection.end();
        return beautifulPokemonResult(rows);
    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

async function getPokemonUnobtainedByTypeWithoutDlc(type) {

    let id = ""

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM type WHERE type_name = '${type}'`);
        connection.end();

        id = rows[0].type_id
    }
    catch (error) {
        console.log(error);
        connection.end();
    }

    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0 AND (pokemon_type_1 = ${id} OR pokemon_type_2 = ${id}) AND pokemon_id < 231`);
        connection.end();
        return beautifulPokemonResult(rows);
    }
    catch (error) {
        console.log(error);
        connection.end();
    }
}

async function setPokemonObtained(id) {
    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`UPDATE pokemon SET pokemon_obtained = 1 WHERE pokemon_id = ${id}`);
        connection.end();
        return true;
    }
    catch (error) {
        console.log(error);
        connection.end();
        return false;
    }
}

async function setPokemonUnobtained(id) {
    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`UPDATE pokemon SET pokemon_obtained = 0 WHERE pokemon_id = ${id}`);
        connection.end();
        return true;
    }
    catch (error) {
        console.log(error);
        connection.end();
        return false;
    }
}

async function getPokemonUnobtainedByName(name) {
    try {
        connection = await connectionPool.getConnection();
        const rows = await connection.query(`SELECT * FROM pokemon WHERE pokemon_shiny_lock = 0 AND pokemon_obtained = 0 AND pokemon_name='${name}'`);
        connection.end();
        return await beautifulPokemonResult(rows);
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
        connection.end();


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

        const listType = {}

        countType.sort(function (b, a) {
            return a.count - b.count;
        });

        countType.forEach(element => {
            listType[element.name] = element.count
        })

        connection.end();
        return listType;

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
        connection.end();

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

        const listType = {}

        countType.sort(function (b, a) {
            return a.count - b.count;
        });

        countType.forEach(element => {
            listType[element.name] = element.count
        })

        connection.end();
        return listType;

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

app.get('/unobtained/type/:name', async (req, res) => {

    const pokemon = await getPokemonUnobtainedByTypeWithoutDlc(req.params.name)

    res.send(pokemon)
})

app.get('/unobtained/type/:name/dlc', async (req, res) => {

    const pokemon = await getPokemonUnobtainedByType(req.params.name)

    res.send(pokemon)
})

app.get('/unobtained/pokemon/catch/:id', async (req, res) => {

    const pokemon = await setPokemonObtained(req.params.id)

    res.send(pokemon)
})

app.get('/unobtained/pokemon/uncatch/:id', async (req, res) => {

    const pokemon = await setPokemonUnobtained(req.params.id)

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
