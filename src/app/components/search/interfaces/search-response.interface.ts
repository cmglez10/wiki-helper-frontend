import { Section } from '../../../constants/section.enum';

export interface ISearchData {
  groupId: number | null;
  section: Section;
  flags: boolean | null;
}
