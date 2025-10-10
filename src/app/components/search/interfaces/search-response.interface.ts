import { Section } from '../../../constants/section.enum';

export enum SearchOrigin {
  FRF = 0,
  FRE = 1,
}

export interface ISearchDataFre {
  origin: SearchOrigin.FRE;
  groupId: number;
  section: Section;
  flags: boolean;
}

export interface ISearchDataFrf {
  origin: SearchOrigin.FRF;
  url: string;
}

export type ISearchData = ISearchDataFre | ISearchDataFrf;
