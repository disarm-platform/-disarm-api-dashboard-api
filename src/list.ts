import fs from 'fs';
import axios from 'axios';
import express from 'express';
import { get, isNull, isUndefined, uniq } from 'lodash';

import { CONFIG } from './config';
import {
  AirtableRecord, OpenFaasRecord,
  AirtableSection, OpenfaasSection,
  ComputedSection, CombinedRecord, BasicRecord
} from './types';

export async function list(req: express.Request, res: express.Response) {
  try {
    const data = await fetch_and_combine();
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(error.message || 'Not sure what happened');
  }
}

async function fetch_and_combine() {
  let openfaas_data: OpenFaasRecord[];
  let airtable_data: AirtableRecord[];

  try {
    // airtable_data = await fetch_airtable();
    // openfaas_data = await fetch_openfaas();
    // fs.writeFileSync('sample_responses/airtable_data.json', JSON.stringify(airtable_data));
    // fs.writeFileSync('sample_responses/openfaas_data.json', JSON.stringify(openfaas_data));
    airtable_data = JSON.parse(fs.readFileSync('sample_responses/airtable_data.json', 'utf8'));
    openfaas_data = JSON.parse(fs.readFileSync('sample_responses/openfaas_data.json', 'utf8'));
  } catch (e) {
    console.error(e);
    throw new Error(
      'Cannot get Airtable or OpenFaas data - check connections and/or credentials?'
    );
  }

  return combine(airtable_data, openfaas_data);
}

async function fetch_airtable(): Promise<AirtableRecord[]> {
  const url = CONFIG.airtable_url;
  const headers = { Authorization: CONFIG.airtable_key };
  try {
    const res = await axios.get(url, { headers });
    const records = get(res, 'data.records', []);
    if (records) {
      return records.map((record: any) => record.fields);
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    throw new Error('Missing data from Airtable request');
  }
}

async function fetch_openfaas(): Promise<OpenFaasRecord[]> {
  //  Make request
  const url = `${CONFIG.openfaas_url}/system/functions`;
  const headers = { Authorization: CONFIG.openfaas_key };
  try {
    const res = await axios.get(url, { headers });
    // TODO: Not sure why we need to check
    if (res.data && res.data.length > 0) {
      return res.data.map((fields: any[]) => fields);
    } else {
      throw new Error('Broken');
    }
  } catch (e) {
    console.error(e);
    throw new Error('Missing data from OpenFaas request');
  }
}

function combine(airtable_data: AirtableRecord[], openfaas_data: OpenFaasRecord[]): CombinedRecord[] {
  const uniq_names = all_unique_names(airtable_data, openfaas_data);

  return uniq_names.map((uniq_name) => {
    const airtable_record = find_airtable_record_by_name(uniq_name, airtable_data);
    const openfaas_record = find_openfaas_record_by_name(uniq_name, openfaas_data);

    const airtable_section: AirtableSection = {
      repo: airtable_record?.repo,
      target_image_version: airtable_record?.image_version,
      env_vars: airtable_record?.env_vars,
      labels: airtable_record?.labels,
      secrets: airtable_record?.secrets,
    };

    const openfaas_section: OpenfaasSection = {
      deployed_image_version: openfaas_record?.image,
      deployed_invocation_count: openfaas_record?.invocationCount,
      replicas: openfaas_record?.replicas,
    };

    const basic: BasicRecord = {
      function_name: uniq_name,
      ...airtable_section,
      ...openfaas_section,
    };

    const computed = compute(basic, airtable_record, openfaas_record);

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

function compute(
  basic: BasicRecord,
  airtable_record?: AirtableRecord,
  openfaas_record?: OpenFaasRecord
): ComputedSection {
  const deployed = !!(basic.deployed_image_version !== null);
  const running = !!(deployed && basic.replicas && basic.replicas > 0);
  const testable = !!(deployed && (basic.test_req !== null));
  const upgradable = !!(deployed && !isNull(basic.deployed_image_version) &&
    !isNull(basic.target_image_version) && (basic.deployed_image_version !== basic.target_image_version));
  const missing_from_airtable = isUndefined(airtable_record?.function_name);
  const missing_from_openfaas = isUndefined(openfaas_record?.image);

  const computed = {
    deployed,
    running,
    testable,
    upgradable,
    missing_from_airtable,
    missing_from_openfaas,
  };

  return computed;
}
