// app/store/settingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  darkMode: boolean;
  animationsEnabled: boolean;
}

const initialState: SettingsState = {
  darkMode: true,
  animationsEnabled: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    toggleAnimations: (state) => {
      state.animationsEnabled = !state.animationsEnabled;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setAnimations: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  toggleAnimations,
  setDarkMode,
  setAnimations,
} = settingsSlice.actions;

export default settingsSlice.reducer;
