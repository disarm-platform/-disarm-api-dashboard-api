import axios from 'axios';
import express from 'express';

import { CONFIG } from './config';

export async function deploy(req: express.Request, res: express.Response) {
  try {
    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.openfaas_key };
    const params = req.body;
    const log_res = await axios.post(url, { headers, params });
    res.end(log_res.data);
  } catch (error) {
    console.error(error);
  }
}

export async function undeploy(res: express.Response, function_name: string) {
  try {
    const url = `${CONFIG.openfaas_url}/system/functions`;
    const headers = { Authorization: CONFIG.airtable_key };
    const params = { functionName: function_name };
    const log_res = await axios.delete(url, { headers, params });
    res.end(log_res.data);
  } catch (error) {
    console.error(error);
  }
}
