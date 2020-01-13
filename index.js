const get = require("lodash").get;
const axios = require("axios");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

exports.get_data = function (req, res) {
  fetch_and_combine()
    .then(data => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    });
};

async function fetch_and_combine() {
  try {
    const static_info = await fetch_static_info();
    const fn_status = await fetch_openfaas_functions();
    return combine(static_info, fn_status);
  } catch (e) {
    throw new Error(
      "Cannot get OpenFaas or Airtable data - check connections and/or credentials?"
    );
  }
}

async function fetch_static_info() {
  const url = "https://api.airtable.com/v0/app2A1oMnkLm1B747/algos";
  const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
  const headers = { Authorization: AIRTABLE_KEY };
  const res = await axios.get(url, { headers });
  const records = get(res, "data.records", []);
  if (records) {
    return records.map(record => normalise_static_fields(record.fields));
  }

  return [];
}

function normalise_static_fields(fields) {
  return {
    function_name: get(fields, "function_name", "no function - impossible?"),
    repo: get(fields, "repo", "none - weird"),
    ui: get(fields, "ui", "none"),
    ui_repo: get(fields, "ui_repo", "none"),
    uses: get(fields, "uses", "no registered uses"),
    dev_notes: get(fields, "dev_notes", "none"),
  };
}

async function fetch_openfaas_functions() {
  //  Make request
  const url = "https://faas.srv.disarm.io/system/functions";
  const OPENFAAS_KEY = process.env.OPENFAAS_KEY;
  const headers = {
    Authorization: OPENFAAS_KEY
  };
  try {
    const res = await axios.get(url, { headers });
    //  Check response
    if (res.data && res.data.length > 0) {
      return res.data.map(fields => normalise_status_fields(fields));
    }
    throw new Error("Missing data from OpenFaas request");
  } catch (e) {
    throw new Error("Missing data from OpenFaas request");
  }
}

function normalise_status_fields(fields) {
  return {
    function_name: get(fields, "name", "no function"),
    image: get(fields, "image", "no image")
  };
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
