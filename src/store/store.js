// Redux store configuration with a single reducer
import { configureStore } from "@reduxjs/toolkit";
import crmReducer from "./crmSlice";

export const store = configureStore({
  reducer: {
    crm: crmReducer,
  },
});

export default store;
