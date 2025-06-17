export interface TeamInfo {
  completeName: string;
  region: string;
  town: string;
  foundationYear: string;
  ground: string;
  coordinates?: Array<string>;
}

export interface Team extends TeamInfo {
  originalName: string;
  name: string;
  shield?: string;
}
