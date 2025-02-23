export interface TeamInfo {
  completeName: string;
  flag: string;
}

export interface Result {
  home: number;
  away: number;
}

export interface RecordResult {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  result: Result;
  goals: number;
}

interface Records {
  biggestHomeWin: RecordResult;
  biggestAwayWin: RecordResult;
  moreGoalsMatch: RecordResult;
}

export interface ResultsData {
  teams: Array<TeamInfo>;
  results: Array<Array<Result>>;
  records: Records;
}
