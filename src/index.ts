import express from 'express';

import { list } from './list';
import { undeploy } from './undeploy';
import { deploy } from './deploy';

exports.get_data = async (req: express.Request, res: express.Response) => {
  const [, command] = req.path.split('/'); // Yup, need that first comma!

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  switch (command) {
    case '':
      list(req, res);
      break;
    case 'list':
      list(req, res);
      break;
    case 'deploy':
      deploy(req, res);
      break;
    case 'undeploy':
      undeploy(req, res);
      break;
    default:
      res.writeHead(400);
      res.end('Unknown request - not sure what you\'re trying to do. Check request');
      break;
  }
};
