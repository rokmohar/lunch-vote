import * as functions from 'firebase-functions';
import axios from 'axios';
import { ImageAnnotatorClient } from '@google-cloud/vision/build/src';
import { parse } from 'node-html-parser';
import * as express from 'express';

const parseHtml = (response: express.Response, url: string, selector: string, responseType: string): void => {
  axios
    .request({
      url,
      method: 'GET',
    })
    .then((res) => {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET, POST");

      const node = parse(res.data).querySelector(selector);

      if (responseType === 'text') {
        if (node && node.structuredText) {
          response.status(200).contentType('text/plain').send(node.structuredText);
        } else {
          response.status(204).contentType('text/plain').send();
        }
      } else {
        if (node && node.innerHTML) {
          response.status(200).contentType('text/html').send(node.innerHTML);
        } else {
          response.status(204).contentType('text/html').send();
        }
      }
    })
    .catch((error) => console.error(error));
}

export const queryHtmlParse = functions
  .https
  .onRequest((request, response) => {
    if (request.method !== 'GET') {
      response.status(400).send('Only GET request method is allowed.');
      return;
    }
    if (typeof request.query.url !== 'string') {
      response.status(400).send('URL param is missing.');
      return;
    }
    if (typeof request.query.selector !== 'string') {
      response.status(400).send('Selector param is missing.');
      return;
    }
    if (typeof request.query.responseType !== 'string') {
      response.status(400).send('ResponseType param is missing.');
      return;
    }

    const selector = request.query.selector.replace(/\+/g, '#');

    parseHtml(response, request.query.url, selector, request.query.responseType);
  });

export const httpHtmlParse = functions
  .https
  .onRequest((request, response) => {
    if (request.method !== 'POST') {
      response.status(400).send('Only POST request method is allowed.');
      return;
    }
    if (typeof request.body.url !== 'string') {
      response.status(400).send('URL param is missing.');
      return;
    }
    if (typeof request.body.selector !== 'string') {
      response.status(400).send('Selector param is missing.');
      return;
    }
    if (typeof request.body.responseType !== 'string') {
      response.status(400).send('ResponseType param is missing.');
      return;
    }
    parseHtml(response, request.body.url, request.body.selector, request.body.responseType);
  });

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
        response.status(res.status).contentType(res.headers['content-type']).send(res.data);
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
