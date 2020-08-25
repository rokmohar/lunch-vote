import * as functions from 'firebase-functions';
import axios from 'axios';
import { ImageAnnotatorClient } from '@google-cloud/vision/build/src';

export const httpProxy = functions
  .https
  .onRequest((request, response) => {
    if (request.method !== 'POST') {
      response.status(400).send('Only POST request method is allowed.');
      return;
    }
    axios
      .request(request.body)
      .then((res) => {
        response.set("Access-Control-Allow-Origin", "*");
        response.set("Access-Control-Allow-Methods", "POST");
        response.status(res.status).send(res.data);
      })
      .catch((error) => console.error(error));
  });

export const imageTextDetection = functions
  .https
  .onRequest((request, response) => {
    if (request.method !== 'POST') {
      response.status(400).send('Only POST request method is allowed.');
      return;
    }

    const client = new ImageAnnotatorClient();

    client.documentTextDetection(request.body.imageUrl)
      .then(([{ textAnnotations }]) => {
        response.set("Access-Control-Allow-Origin", "*");
        response.set("Access-Control-Allow-Methods", "POST");

        if (!textAnnotations) {
          response.status(200).send({ text: null });
          return;
        }

        const annotation = textAnnotations[0];
        const text = annotation && annotation.description || null;

        response.status(200).send({ text });
      })
      .catch((error) => console.error(error));
  });
