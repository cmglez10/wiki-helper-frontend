export interface LeagueTeam {
  position: number;
  name: string;
  teamInfo: TeamInfo;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  sanction: number;
}

export interface TeamInfo {
  completeName: string;
  region: string;
  town: string;
}
