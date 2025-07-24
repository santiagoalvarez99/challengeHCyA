import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TabItem } from "./types";

interface TabsState {
  tabs: TabItem[];
  activeTabId: string;
}

const initialState: TabsState = {
  tabs: [],
  activeTabId: "",
};

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<TabItem>) => {
      const exists = state.tabs.find((tab) => tab.id === action.payload.id);
      if (!exists) {
        state.tabs.push(action.payload);
      }
      state.activeTabId = action.payload.id;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    closeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.id !== action.payload);
      if (state.activeTabId === action.payload) {
        state.activeTabId =
          state.tabs.length > 0 ? state.tabs[state.tabs.length - 1].id : "";
      }
    },
    updateTabState: (
      state,
      action: PayloadAction<{ id: string; newState: unknown }>
    ) => {
      const tab = state.tabs.find((tab) => tab.id === action.payload.id);
      if (tab) {
        tab.state = action.payload.newState;
      }
    },
  },
});

export const { addTab, setActiveTab, closeTab, updateTabState } =
  tabsSlice.actions;
export default tabsSlice.reducer;
