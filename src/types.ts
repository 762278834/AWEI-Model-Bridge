export type UiState = {
  profiles: string[];
  active_profile: string | null;
  config_path: string;
  state_path: string;
};

export type ProfileDetail = {
  name: string;
  values: Record<string, string>;
};

export type TestResult = {
  ok: boolean;
  http_status: number | null;
  reason: string;
  suggestion: string;
  raw: string;
};
