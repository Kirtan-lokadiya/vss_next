import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a simple app slice
const appSlice = createSlice({
  name: 'app',
  initialState: {
    theme: 'system',
    sidebarOpen: false,
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { setTheme, toggleSidebar, setSidebarOpen } = appSlice.actions;

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;