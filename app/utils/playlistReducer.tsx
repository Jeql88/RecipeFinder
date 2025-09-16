// utils/playlistReducer.ts
import { PlaylistState, PlaylistAction } from "./types";

export const initialState: PlaylistState = {
  present: [],
  past: [],
  future: []
};

export function playlistReducer(state: PlaylistState, action: PlaylistAction): PlaylistState {
  const { present, past, future } = state;

  switch (action.type) {
    case "ADD_SONG":
      return {
        present: [...present, action.payload],
        past: [...past, present],
        future: []
      };

    case "REMOVE_SONG":
      return {
        present: present.filter(song => song.id !== action.payload.id),
        past: [...past, present],
        future: []
      };

    case "CLEAR":
      return {
        present: [],
        past: [...past, present],
        future: []
      };

    case "UNDO":
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        present: previous,
        past: newPast,
        future: [present, ...future]
      };

    case "REDO":
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        present: next,
        past: [...past, present],
        future: newFuture
      };

    case "SET_FULL_STATE":
      return action.payload;

    default:
      return state;
  }
}
