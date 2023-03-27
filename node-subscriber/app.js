//
// Copyright 2021 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const lzbase62 = require('lzbase62');
const textModel = require('./models/text-compressed.models');
const app = express();
const { connectDB } = require('./config/dbConnect');
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000;
//Corre por defecto en 3500
const daprPort = process.env.DAPR_HTTP_PORT ?? 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const pubsubName = 'pubsub';
connectDB();
app.get('/dapr/subscribe', (_req, res) => {
    res.json([
      {
        pubsubname: 'pubsub',
        topic: 'A',
        route: 'A',
      },
      {
        pubsubname: 'pubsub',
        topic: 'B',
        route: 'B',
      },
      {
        pubsubname: 'pubsub',
        topic: 'Compress',
        route: 'Compress',
      },
    ]);
});

app.post('/A', (req, res) => {
    console.log("A: ", req.body.data.message);
    res.sendStatus(200);
});

app.post('/B', (req, res) => {
    console.log("B: ", req.body.data.message);
    res.sendStatus(200);
});

app.post('/Compress', async (req, res) => {
  //Imprime mensaje compreso
  var text = req.body.data.message;
  console.log('Compress: ', text);
  var compressed = await lzbase62.compress(text);
  const newBody = {
    messageType: 'resultado',
    message: compressed,
  };
  console.log('Compress: ', compressed);
  await saveInDB(text, compressed);
  await axios.post(`${daprUrl}/publish/${pubsubName}/resultado`, newBody);
  res.sendStatus(200);
});

const saveInDB=async (text, compressed)=>{
const textDB = new textModel({
  text,
  compressedText: compressed,
});
await textDB.save();
}
app.listen(port, () => console.log(`Node App listening on port ${port}!`));
