export type ContractType = 'PERMANENT' | 'TEMPORARY' | 'CONTRACTOR';
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export interface Contract {
  id: string;
  driver_id: string;
  contract_number: string;
  contract_type: ContractType;
  start_date: Date;
  end_date: Date | null;
  salary: number;
  benefits: any;
  status: ContractStatus;
  signed_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContractInput {
  driver_id: string;
  contract_type: ContractType;
  start_date: Date;
  end_date?: Date;
  salary: number;
  benefits?: any;
  signed_date?: Date;
}
