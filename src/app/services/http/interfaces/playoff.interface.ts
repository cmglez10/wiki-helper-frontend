export interface PlayoffMatch {
  date: string;
  homeName: string;
  awayName: string;
  homeCompleteName: string;
  awayCompleteName: string;
  homeFlag: string;
  awayFlag: string;
  homeGoals: number;
  awayGoals: number;
  extraTime: boolean;
  homePenalties: number;
  awayPenalties: number;
}

export interface Playoff {
  matches: PlayoffMatch[];
  winner: 1 | 2;
}

export interface PlayoffRound {
  name: string;
  playoffs: Playoff[];
}
