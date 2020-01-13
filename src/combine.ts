import fs from "fs";
import {combine} from "./index";

const airtable_data = JSON.parse(fs.readFileSync("./sample_responses/airtable_data.json", "utf8"));
const openfaas_data = JSON.parse(fs.readFileSync("./sample_responses/openfaas_data.json", "utf8"));

const result = combine(airtable_data, openfaas_data);

// tslint:disable-next-line: no-console
console.log(JSON.stringify(result, null, 2));
