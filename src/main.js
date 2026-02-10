import express, { response } from 'express'
import mariadb from "mariadb";
import { loadEnvFile } from 'node:process'

loadEnvFile('./.env');

const connectionPool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.CONNECTION_LIMIT_AMOUNT
});

let connection;

const app = express();

const appPort = 3000

app.listen(appPort, () => {
    console.log(`app launched on port ${appPort}`);
})
