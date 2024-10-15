export interface CallResponse {
  id: string;
  state: string;
  direction: string;
  from: string;
  to: string;
  created: string;
}

export interface MakeCallRequest {
  phoneNumber: string;
}
