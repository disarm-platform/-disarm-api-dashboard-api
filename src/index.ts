import axios from "axios";
import dotenv from "dotenv";
import express from "express";
// import fs from "fs";
import { get } from "lodash";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

exports.get_data = async (_: any, res: express.Response) => {
  try {
    const data = await fetch_and_combine();
    res.writeHead(200, { "Content-Type": "application/json" });
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
      "Cannot get OpenFaas or Airtable data - check connections and/or credentials?"
    );
  }
}

interface AirtableRecord {
  function_name: string;
  image_version: string;
  repo: string;
  scale_to_zero: boolean;
  hide_from_deploy: boolean;
}

async function fetch_airtable(): Promise<AirtableRecord[]> {
  const url = "https://api.airtable.com/v0/app2A1oMnkLm1B747/algos";
  const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
  const headers = { Authorization: AIRTABLE_KEY };
  const res = await axios.get(url, { headers });
  const records = get(res, "data.records", []);
  if (records) {
    return records.map((record: any) => record.fields);
  }

  return [];
}

interface OpenFaasRecord {
  name: string;
  image: string;
  invocationCount: number;
  replicas: number;
  availableReplicas: number;
}

async function fetch_openfaas(): Promise<OpenFaasRecord[]> {
  //  Make request
  const url = "https://faas.srv.disarm.io/system/functions";
  const OPENFAAS_KEY = process.env.OPENFAAS_KEY;
  const headers = { Authorization: OPENFAAS_KEY };
  try {
    const res = await axios.get(url, { headers });
    //  Check response
    if (res.data && res.data.length > 0) {
      return res.data.map((fields: any[]) => fields);
    }
    throw new Error("Missing data from OpenFaas request");
  } catch (e) {
    throw new Error("Missing data from OpenFaas request");
  }
}

function combine(airtable_data: any[], openfaas_data: any[]) {

  return airtable_data.map((f) => {
    const remote_image = get(
      find_image_by_name(f.function_name, openfaas_data),
      "image",
      "no image"
    );
    return Object.assign({ image: remote_image }, f, {
      live: remote_image !== "no image"
    });
  });
}

function find_image_by_name(name: string, openfaas_data: any[]) {
  return openfaas_data.find((s) => s.function_name === name);
}
