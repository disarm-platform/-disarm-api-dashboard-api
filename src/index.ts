import express from 'express';

import { list } from './list';
import { deploy, undeploy } from './actions';

function missing_function_name(res: express.Response) {
  res.writeHead(400);
  res.end('Missing function_name in path');
}

exports.get_data = async (req: express.Request, res: express.Response) => {
  const [, command, function_name] = req.path.split('/'); // Yup, need that first comma!

  switch (command) {
    case '':
      list(res);
      break;
    case 'list':
      list(res);
      break;
    case 'deploy':
      if (!function_name) {
        return missing_function_name(res);
      }
      deploy(req, res);
      break;
    case 'undeploy':
      if (!function_name) {
        return missing_function_name(res);
      }
      undeploy(req, res, function_name);
      break;
    default:
      res.writeHead(400);
      res.end('Unknown request - not sure what you\'re trying to do. Check request');
      break;
  }
};
