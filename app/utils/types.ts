// app/utils/types.ts
export interface Song {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  addedAt: number;
}

export interface PlaylistState {
  present: Song[];
  past: Song[][];
  future: Song[][];
}

export type PlaylistAction = 
  | { type: "ADD_SONG"; payload: Song }
  | { type: "REMOVE_SONG"; payload: { id: string } }
  | { type: "CLEAR" }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_FULL_STATE"; payload: PlaylistState };