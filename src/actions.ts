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
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(typeof data);
    await axios.post('/user',data).then((response) => {
      console.log(response);
    })
      .catch((error) => {
        console.log(error);
      });
    console.log('Well its not me, check the return ');
    return action_success(res, `Deployed ${JSON.stringify(req.body)}`);
  } catch (error) {
    if ('response' in error) {
      return action_error(res, error.response.data);
    } else {
      console.error(error);
      return action_error(res, error.message);
    }
  }

}
async function get_deploy_params(service: string){
  const stack_url = `https://raw.githubusercontent.com/disarm-platform/${service}/master/stack.yml`;
    await axios.get(stack_url).then((response) => {
      const obj = YAML.parse(response.data).functions[`${service}`];
      const image = obj.image;
      const envVars = obj.environment;
      const secrets = obj.secrets;
      const labels = obj.labels;
      const payload = {
        service,
        image,
        envVars,
        secrets,
        labels
      };
       return payload;
      })
    .catch((error) => {
        console.log(error);
        return {};
    });
}
function has_required_deploy_params(req: express.Request): boolean {
  // const {service, image } = req.body; 
  return true;
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
  res.end(message);
}
