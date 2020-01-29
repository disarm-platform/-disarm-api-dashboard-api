import axios from 'axios';
import express from 'express';

import { CONFIG } from './config';

export async function deploy(req: express.Request, res: express.Response) {
  try {
    if (!has_required_deploy_params(req)) {
      return action_error(res, 'Missing required service or image parameters for deploy');
    }

    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.openfaas_key };
    const data = req.body;
    // console.log('url, headers, data', url, headers, data);

    const fn_res = await axios.post(url, data, { headers });
    // console.log(fn_res.data);

    return action_success(res, `Deployed ${JSON.stringify(req.body)}`);
  } catch (error) {
    if ('response' in error) {
      console.log(error);
      return action_error(res, error.response.data);
    } else {
      return action_error(res, error.message);
    }
  }

}

function has_required_deploy_params(req: express.Request): boolean {
  const { service, image } = req.body;
  return service && image;
}

export async function undeploy(req: express.Request, res: express.Response, function_name: string) {
  try {
    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.openfaas_key };
    const params = { functionName: function_name };

    // data property required below because it's a DELETE method
    await axios.delete(url, { headers, data: params });

    return action_success(res, `Success undeploying ${function_name}`);
  } catch (error) {
    if ('response' in error) {
      return action_error(res, error.response.data);
    } else {
      console.error(error);
      return action_error(res, error.message);
    }
  }
}

function action_success(res: express.Response, message: string = 'General success') {
  res.writeHead(200);
  res.end(message);
}
function action_error(res: express.Response, message: string) {
  res.writeHead(500);
  console.log('message', message);
  res.end(message);
}
