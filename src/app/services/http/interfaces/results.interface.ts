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
}

interface Records {
  biggestHomeWin: RecordResult;
  biggestAwayWin: RecordResult;
  moreGoalsMatch: RecordResult;
}

export interface ResultsData {
  teams: Array<Team>;
  results: Array<Array<Result>>;
  records: Records;
}
