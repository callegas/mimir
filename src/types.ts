export interface Trophy {
  id: string;
  name: string;
  description: string;
  dlc: string | null;
  missable: boolean;
  done: boolean;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type GameMode = "explore" | "platinum";

export interface Game {
  name: string;
  mode: GameMode;
  trophies: Trophy[];
  notes: string;
  history: Message[];
}
