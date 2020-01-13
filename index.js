const get = require("lodash").get;
const axios = require("axios");
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

exports.get_data = function (req, res) {
  fetch_and_combine()
    .then(data => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    })
    .catch(e => {
      console.error(e);
    });
};

async function fetch_and_combine() {
  try {
    const static_info = await fetch_airtable();
    const fn_status = await fetch_openfaas();

    // TODO: Remove debug files
    fs.writeFileSync('static_info.json', JSON.stringify(static_info))
    fs.writeFileSync('fn_status.json', JSON.stringify(fn_status))

    return combine(static_info, fn_status);
  } catch (e) {
    throw new Error(
      "Cannot get OpenFaas or Airtable data - check connections and/or credentials?"
    );
  }
}

async function fetch_airtable() {
  const url = "https://api.airtable.com/v0/app2A1oMnkLm1B747/algos";
  const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
  const headers = { Authorization: AIRTABLE_KEY };
  const res = await axios.get(url, { headers });
  const records = get(res, "data.records", []);
  if (records) {
    return records.map(record => record.fields);
  }

  return [];
}

async function fetch_openfaas() {
  //  Make request
  const url = "https://faas.srv.disarm.io/system/functions";
  const OPENFAAS_KEY = process.env.OPENFAAS_KEY;
  const headers = { Authorization: OPENFAAS_KEY };
  try {
    const res = await axios.get(url, { headers });
    //  Check response
    if (res.data && res.data.length > 0) {
      return res.data.map(fields => fields);
    }
    throw new Error("Missing data from OpenFaas request");
  } catch (e) {
    throw new Error("Missing data from OpenFaas request");
  }
}

function combine(static_info, fn_status) {

  return static_info.map(f => {
    const remote_image = get(
      find_image_by_name(f.function_name, fn_status),
      "image",
      "no image"
    );
    return Object.assign({ image: remote_image }, f, {
      live: remote_image !== "no image"
    });
  });
}

function find_image_by_name(name, fn_status) {
  return fn_status.find(s => s.function_name === name);
}
