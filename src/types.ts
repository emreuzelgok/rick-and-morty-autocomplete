export interface Origin {
  name: string;
  url: string;
}

export interface Info {
  count: number;
  pages: number;
  next: string;
  prev?: any;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: Origin;
  location: Origin;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export type ApiResponse = { info: Info, results: Character[] }