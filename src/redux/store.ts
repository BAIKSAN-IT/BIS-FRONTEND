import { configureStore } from "@reduxjs/toolkit";
import assetReducer from "./asset/assetSlice";
import authReducer from "./common/authSlice";
import commonReducer from "./common/commonSlice";
import layoutReducer from "./common/layoutSlice";
import loadingMiddleware from "./common/loadingMiddleware";
import loadingReducer from "./common/loadingSlice";
import visitedPagesReducer from "./common/visitedPagesSlice";
import factoryCuttingReducer from "./factory/factoryCuttingSlice";
import factoryIronReducer from "./factory/factoryIronSlice";
import factoryKnittingReducer from "./factory/factoryKnittingSlice";
import factoryNeedleReducer from "./factory/factoryNeedleSlice";
import factoryPackingReducer from "./factory/factoryPackingSlice";
import factoryQcReducer from "./factory/factoryQcSlice";
import factorySewingReducer from "./factory/factorySewingSlice";
import tabletFoldingReducer from "./tablet/tabletFoldingSlice";
import tabletNeedleReducer from "./tablet/tabletNeedleSlice";
import tabletPackingReducer from "./tablet/tabletPackingSlice";
import tabletQcReducer from "./tablet/tabletQcSlice";
import tabletSewingReducer from "./tablet/tabletSewingSlice";
import tabletReducer from "./tablet/tabletSlice";
import systemUserReducer from "./system/SystemUserSlice";
import systemProgramReducer from "./system/SystemProgramSlice";

/* 새로 추가 */
import favoriteReducer from "./rnd/favoriteSlice";
import RecapReducer from "./rnd/RecapSlice";
import SendingReducer from "./rnd/SendingSlice";
import ReturnReducer from "./rnd/ReturnSlice";
import srsReducer from "./srs/srsSlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const visitedPagesPersistConfig = {
  key: "VisitedPages",
  storage,
  whitelist: ["pages", "userId"], // 이 두 개만 저장
};

const systemProgramPersistConfig = {
  key: "systemProgram",
  storage,
  whitelist: ["programList", "language"],
};
const rootReducer = {
  Asset: assetReducer,
  Auth: authReducer,
  Common: commonReducer,
  Layout: layoutReducer,
  Loading: loadingReducer,
  VisitedPages: persistReducer(visitedPagesPersistConfig, visitedPagesReducer),
  FactoryCutting: factoryCuttingReducer,
  FactoryIron: factoryIronReducer,
  FactoryKnitting: factoryKnittingReducer,
  FactoryNeedle: factoryNeedleReducer,
  FactoryPacking: factoryPackingReducer,
  FactoryQc: factoryQcReducer,
  FactorySewing: factorySewingReducer,
  TabletFolding: tabletFoldingReducer,
  TabletNeedle: tabletNeedleReducer,
  TabletPacking: tabletPackingReducer,
  TabletQc: tabletQcReducer,
  TabletSewing: tabletSewingReducer,
  Tablet: tabletReducer,
  systemUser: systemUserReducer,
  systemProgram: persistReducer(systemProgramPersistConfig, systemProgramReducer),
  favorite: favoriteReducer,
  recap: RecapReducer,
  sending: SendingReducer,
  return: ReturnReducer,
  Srs: srsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(loadingMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

