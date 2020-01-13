import axios from 'axios';
import dotenv from 'dotenv';
import express from 'express';
// import fs from "fs";
import { get, uniq} from 'lodash';
import { AirtableRecord, OpenFaasRecord, CombinedRecord } from './type';

const DEFAULTS = {
  scale_to_zero: false,
};

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

exports.get_data = async (_: any, res: express.Response) => {
  try {
    const data = await fetch_and_combine();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
};

async function fetch_and_combine() {
  try {
    const airtable_data = await fetch_airtable();
    const openfaas_data = await fetch_openfaas();

    // TODO: Remove debug files
    // fs.writeFileSync('airtable_data.json', JSON.stringify(airtable_data))
    // fs.writeFileSync('openfaas_data.json', JSON.stringifyopenfaas_datafn_status))

    return combine(airtable_data, openfaas_data);
  } catch (e) {
    throw new Error(
      'Cannot get OpenFaas or Airtable data - check connections and/or credentials?'
    );
  }
}

async function fetch_airtable(): Promise<AirtableRecord[]> {
  const url = 'https://api.airtable.com/v0/app2A1oMnkLm1B747/algos';
  const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
  const headers = { Authorization: AIRTABLE_KEY };
  const res = await axios.get(url, { headers });
  const records = get(res, 'data.records', []);
  if (records) {
    return records.map((record: any) => record.fields);
  }

  return [];
}

async function fetch_openfaas(): Promise<OpenFaasRecord[]> {
  //  Make request
  const url = 'https://faas.srv.disarm.io/system/functions';
  const OPENFAAS_KEY = process.env.OPENFAAS_KEY;
  const headers = { Authorization: OPENFAAS_KEY };
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

export function combine(airtable_data: AirtableRecord[], openfaas_data: OpenFaasRecord[]): CombinedRecord[] {
  const uniq_names = all_unique_names(airtable_data, openfaas_data);

  return uniq_names.map((uniq_name) => {
    const airtable_record = find_airtable_record_by_name(uniq_name, airtable_data);
    const openfaas_record = find_openfaas_record_by_name(uniq_name, openfaas_data);

    return {
      function_name: uniq_name,
      repo: airtable_record?.repo || null,
      target_image_version: airtable_record?.image_version || null,
      deployed_image_version: openfaas_record?.image || null,
      deployed_invocation_count: openfaas_record?.invocationCount || null,
      availableReplicas: openfaas_record?.availableReplicas || null,
      test_req: airtable_record?.test_req || null,
      scale_to_zero: airtable_record?.scale_to_zero || false,
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

function find_image_by_name(name: string, openfaas_data: any[]) {
  return openfaas_data.find((s) => s.function_name === name);
}
