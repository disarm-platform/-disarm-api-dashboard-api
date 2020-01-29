export interface IncomingAirtableRecord {
  function_name: string;
  target_image_version: string;
  repo: string;
  test_req: string;
  env_vars: string;
  labels: string;
  secrets: string;
}

export interface IncomingOpenFaasRecord {
  name: string;
  image: string;
  invocationCount: number;
  replicas: number;
  availableReplicas: number;
}

export type OutgoingBasicRecord = { function_name: string } & OutgoingAirtableSection & OutgoingOpenfaasSection;

export interface OutgoingAirtableSection {
  repo?: string;
  target_image_version?: string;
  env_vars?: string;
  labels?: string;
  secrets?: string;
  test_req?: string;
}

export interface OutgoingOpenfaasSection {
  deployed_image_version?: string; // openfaas_record.image
  deployed_invocation_count?: number; // openfaas_record.invocationCount
  replicas?: number; // openfaas_record.replicas
}

export interface ComputedSection {
  deployed: boolean;
  running: boolean;
  upgradable: boolean;
  testable: boolean;
  missing_from_airtable: boolean;
  missing_from_openfaas: boolean;
}

export interface CombinedRecord extends OutgoingBasicRecord { computed: ComputedSection; }
