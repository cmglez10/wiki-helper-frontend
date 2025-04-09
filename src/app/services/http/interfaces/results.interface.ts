export interface Team {
  completeName: string;
  name: string;
  flag: string;
}

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
}

interface Records {
  biggestHomeWin: Array<RecordResult>;
  biggestAwayWin: Array<RecordResult>;
  moreGoalsMatch: Array<RecordResult>;
}

export interface ResultsData {
  teams: Array<Team>;
  results: Array<Array<Result>>;
  records: Records;
}
