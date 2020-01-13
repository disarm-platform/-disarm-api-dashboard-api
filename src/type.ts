export interface AirtableRecord {
  function_name: string;
  image_version: string;
  repo: string;
  scale_to_zero: boolean;
  hide_from_deploy: boolean;
  test_req: string;
}
export interface OpenFaasRecord {
  name: string;
  image: string;
  invocationCount: number;
  replicas: number;
  availableReplicas: number;
}
export interface CombinedRecord {
  function_name: string;
  repo: string | null;
  target_image_version: string | null;
  deployed_image_version: string | null;
  deployed_invocation_count: number | null;
  availableReplicas: number | null;
  test_req: string | null;
  scale_to_zero: boolean;
}
