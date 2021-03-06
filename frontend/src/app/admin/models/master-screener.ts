import { Question } from '../../shared/models';

export interface QuestionMeta {
  totalCount: number;
}

export interface MasterScreener {
  version: number;
  questions: Question[];
  meta: MasterScreenerMetaData;
}

export interface MasterScreenerMetaData {
  questions: QuestionMeta;
  screener: {
    version: number;
    created: number;
  };
}
