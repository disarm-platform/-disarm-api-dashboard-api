import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
// import fs from 'fs';
import { get, uniq, pick, isUndefined } from 'lodash';
import { AirtableRecord, OpenFaasRecord, BasicRecord, ComputedRecord } from './types';
import { isNull } from 'util';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const CONFIG = {
  airtable_url: 'https://api.airtable.com/v0/app2A1oMnkLm1B747/algos',
  airtable_key: process.env.AIRTABLE_KEY,
  openfaas_url: process.env.OPENFAAS_URL || 'https://faas.srv.disarm.io/system/functions',
  openfaas_key: process.env.OPENFAAS_KEY
};

exports.get_data = async (req: express.Request, res: express.Response) => {
  const split = req.path.split('/');
  const command = split[1];
  const function_name = split[2];

  switch (command) {
    case '':
      list(res);
      break;
    case 'list':
      list(res);
      break;
    case 'deploy':
      if (!function_name) {
        res.writeHead(400);
        res.end('Missing function_name in path');
        return;
      }
      res.send(`deploy ${function_name}`);
      break;
    case 'undeploy':
      if (!function_name) {
        res.writeHead(400);
        res.end('Missing function_name in path');
        return;
      }
      res.send(`undeploy ${function_name}`);
      break;
    case 'logs':
      if (!function_name) {
        res.writeHead(400);
        res.end('Missing function_name in path');
        return;
      }
      res.send(`logs ${function_name}`);
      break;
    default:
      break;
  }
};

async function list(res: express.Response) {
  try {
    const data = await fetch_and_combine();
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }

}

async function fetch_and_combine() {
  try {
    const airtable_data = await fetch_airtable();
    const openfaas_data = await fetch_openfaas();

    // TODO: Remove debug files
    // fs.writeFileSync('airtable_data.json', JSON.stringify(airtable_data));
    // fs.writeFileSync('openfaas_data.json', JSON.stringify(openfaas_data));

    return combine(airtable_data, openfaas_data);
  } catch (e) {
    throw new Error(
      'Cannot get OpenFaas or Airtable data - check connections and/or credentials?'
    );
  }
}

async function fetch_airtable(): Promise<AirtableRecord[]> {
  const url = CONFIG.airtable_url;
  const headers = { Authorization: CONFIG.airtable_key };
  const res = await axios.get(url, { headers });
  const records = get(res, 'data.records', []);
  if (records) {
    return records.map((record: any) => record.fields);
  }

  return [];
}

async function fetch_openfaas(): Promise<OpenFaasRecord[]> {
  //  Make request
  const url = CONFIG.openfaas_url;
  const headers = { Authorization: CONFIG.openfaas_key };
  try {
    const res = await axios.get(url, { headers });
    //  Check response
    if (res.data && res.data.length > 0) {
      return res.data.map((fields: any[]) => fields);
    }
    throw new Error('Missing data from OpenFaas request');
  } catch (e) {
    throw new Error('Missing data from OpenFaas request');
  }
}

export function combine(airtable_data: AirtableRecord[], openfaas_data: OpenFaasRecord[]): BasicRecord[] {
  const uniq_names = all_unique_names(airtable_data, openfaas_data);

  return uniq_names.map((uniq_name) => {
    const airtable_record = find_airtable_record_by_name(uniq_name, airtable_data);
    const openfaas_record = find_openfaas_record_by_name(uniq_name, openfaas_data);

    const default_record = {
      function_name: uniq_name,
      missing_from_airtable: isUndefined(airtable_record?.function_name),
      missing_from_openfaas: isUndefined(openfaas_record?.image),

      // Airtable
      repo: null,
      hide_from_deploy: null,
      target_image_version: null,
      scale_to_zero: false,
      test_req: null,
      uses_template: false,

      // OpenFaas
      deployed_image_version: null,
      deployed_invocation_count: null,
      available_replicas: null,
    };

    const airtable_fields = ['repo', 'hide_from_deploy', 'target_image_version', 'scale_to_zero', 'test_req', 'uses_template'];
    const airtable_properties = pick(airtable_record, airtable_fields);

    const openfaas_fields = ['image', 'invocationCount', 'availableReplicas'];
    const openfaas_properties = pick(openfaas_record, openfaas_fields);

    const renamed_openfaas_properties = {
      deployed_image_version: !isUndefined(openfaas_properties.image) ? openfaas_properties.image : null,
      deployed_invocation_count: !isUndefined(openfaas_properties.invocationCount) ?
        openfaas_properties.invocationCount : null,
      available_replicas: !isUndefined(openfaas_properties.availableReplicas) ?
        openfaas_properties.availableReplicas : null,
    };

    const basic = {
      ...default_record,
      ...airtable_properties,
      ...renamed_openfaas_properties,
    };

    const computed = compute(basic);

    return {
      ...basic,
      computed,
    };
  });
}

function all_unique_names(airtable_data: AirtableRecord[], openfaas_data: OpenFaasRecord[]) {
  const all_names = airtable_data.map((airtable_record) => {
    return airtable_record.function_name;
  }).concat(openfaas_data.map((openfaas_record) => {
    return openfaas_record.name;
  })).sort();
  const unique = uniq(all_names);
  return unique;
}

function find_airtable_record_by_name(name: string, airtable_data: AirtableRecord[]): AirtableRecord | undefined {
  return airtable_data.find((r) => r.function_name === name);
}

function find_openfaas_record_by_name(name: string, openfaas_data: OpenFaasRecord[]): OpenFaasRecord | undefined {
  return openfaas_data.find((r) => r.name === name);
}

function compute(basic: BasicRecord): ComputedRecord {
  const deployed = !!(basic.deployed_image_version !== null);
  const hideable = !!(deployed && basic.hide_from_deploy);
  const running = !!(deployed && basic.available_replicas && basic.available_replicas > 0);
  const sleeping = !!(deployed && (basic.scale_to_zero && basic.available_replicas === 0));
  const testable = !!(deployed && (basic.test_req !== null));
  const upgradable = !!(deployed && !isNull(basic.deployed_image_version) &&
    !isNull(basic.target_image_version) && (basic.deployed_image_version !== basic.target_image_version));

  const computed = {
    deployed,
    hideable,
    running,
    sleeping,
    testable,
    upgradable,
  };

  return computed;
}
