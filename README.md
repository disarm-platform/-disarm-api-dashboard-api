## Configuration
There are four things (so far):

- `OPENFAAS_URL`: defaults to https://faas.srv.disarm.io
- `OPENFAAS_KEY`: **required**
- `AIRTABLE_URL`: defaults to DiSARM Algos table
- `AIRTABLE_KEY`: **required**

Note:
- For _local dev_, need to populate the `.env` file. Changes to its contents are ignored (https://stackoverflow.com/a/3320183/678255)
- For _production_, set environment variables

## Deployment

1. Transpile: `npm run build`
2. Deploy: `gcloud functions deploy disarm-api-dashboard-api --region=europe-west1 --entry-point=get_data`
