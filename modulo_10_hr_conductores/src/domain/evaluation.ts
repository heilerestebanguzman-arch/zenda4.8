export type EvaluationType = 'PERFORMANCE' | 'SAFETY' | 'ANNUAL';

export interface Evaluation {
  id: string;
  driver_id: string;
  evaluation_date: Date;
  type: EvaluationType;
  score: number;
  comments: string;
  evaluator: string;
  next_evaluation_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEvaluationInput {
  driver_id: string;
  evaluation_date: Date;
  type: EvaluationType;
  score: number;
  comments?: string;
  evaluator?: string;
  next_evaluation_date?: Date;
}
