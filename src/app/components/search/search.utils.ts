import { ISearchData, ISearchDataFrf, SearchOrigin } from './interfaces/search-response.interface';

export function isSearchDataFrf(data: ISearchData): data is ISearchDataFrf {
  return data.origin === SearchOrigin.FRF;
}
