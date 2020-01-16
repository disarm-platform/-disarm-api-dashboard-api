import axios from 'axios';
import express from 'express';

import { CONFIG } from './config';

export async function deploy(req: express.Request, res: express.Response) {
  try {
    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.openfaas_key };
    const params = req.body;
    const action_res = await axios.post(url, { headers, params });
    return action_success(res, `Deployed ${req.body}`);
  } catch (error) {
    console.error(error);
    return action_error(res, `Failure deploying function`);
  }
}

export async function undeploy(req: express.Request, res: express.Response, function_name: string) {
  try {
    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.openfaas_key };
    const params = { functionName: function_name };
    const action_res = await axios.delete(url, { headers, data: params });
    if (action_res.status === 202) {
      return action_success(res, `Success undeploying ${function_name}`);
    } else {
      return action_error(res, `Failed undeploying ${function_name}`);
    }
  } catch (error) {
    console.error(error);
    return action_error(res, `Failed undeploying ${function_name}`);
  }
}

function action_success(res: express.Response, message: string = 'General success') {
  res.writeHead(200);
  res.end(message);
}
function action_error(res: express.Response, message: string = 'Not sure what happened') {
  res.writeHead(500);
  res.end(message);
}
