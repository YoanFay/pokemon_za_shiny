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
        connectionPool.end();
        return rows;
    }
    catch (error) {
        console.log(error);
        connectionPool.end();
    }
}

app.get('/unobtained', async (req, res) => {

    const pokemon = await getPokemonUnobtained()
    
    res.send(pokemon)
})

app.listen(appPort, () => {
    console.log(`app launched on port ${appPort}`);
})
