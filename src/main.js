import express, { response } from 'express'

const app = express();

const appPort = 3000

app.listen(appPort, () => {
    console.log(`app launched on port ${appPort}`);
})
