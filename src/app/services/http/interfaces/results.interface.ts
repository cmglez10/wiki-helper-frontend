import { Team } from './team.interface';

export interface Result {
  home: number;
  away: number;
}

export interface RecordResult {
  homeTeam: Team;
  awayTeam: Team;
  result: Result;
  goals: number;
  date: string;
  matchday: number;
  groupId: number;
}

export interface Records {
  biggestHomeWin: Array<RecordResult>;
  biggestAwayWin: Array<RecordResult>;
  moreGoalsMatch: Array<RecordResult>;
}

export interface ResultsData {
  teams: Array<Team>;
  results: Array<Array<Result>>;
  records: Records;
}
