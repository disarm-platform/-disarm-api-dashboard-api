## Configuration
There are four things (so far):

- `OPENFAAS_URL`: defaults to https://faas.srv.disarm.io
- `OPENFAAS_KEY`: **required**
- `AIRTABLE_URL`: defaults to DiSARM Algos table
- `AIRTABLE_KEY`: **required**

Note:
- For local dev, need to populate the `.env` file. Changes to its contents are ignored (https://stackoverflow.com/a/3320183/678255)
- For deployment, set environment variables
