import { TeamInfo } from './team.interface';

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
