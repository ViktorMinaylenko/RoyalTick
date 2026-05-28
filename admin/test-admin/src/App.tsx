import { Admin, defaultTheme, Resource } from "react-admin";
import { authProvider } from "./authProvider";
import dataProvider from "./dataProvider";
import { GoodsList } from "../components/GoodsList/GoodsList";
import { ProductShow } from "../components/ProductShow/ProductShow";
import { UsersList } from "../components/Users/UsersList/UsersList";
import { UsersShow } from "../components/Users/UsersShow/UsersShow";
import { UsersCreate } from "../components/Users/UsersCreate/UsersCreate";
import { UsersEdit } from "../components/Users/UsersEdit/UsersEdit";
import { WatchesCreate } from "../components/Watches/WatchesCreate/WatchesCreate";
import { WatchesEdit } from "../components/Watches/WatchesEdit/WatchesEdit";
import { StrapsCreate } from "../components/Straps/StrapsCreate/StrapsCreate";
import { StrapsEdit } from "../components/Straps/StrapsEdit/StrapsEdit";
import { BoxesCreate } from "../components/Boxes/BoxesCreate/BoxesCreate";
import { BoxesEdit } from "../components/Boxes/BoxesEdit/BoxesEdit";
import { CareCreate } from "../components/Care/CareCreate/CareCreate";
import { CareEdit } from "../components/Care/CareEdit/CareEdit";
import {
  USERS_SOURCE_NAME,
  WATCHES_SOURCE_NAME,
  STRAPS_SOURCE_NAME,
  BOXES_SOURCE_NAME,
  CARE_SOURCE_NAME,
} from "../constants/sourceNames";

export const App = () => (
  <Admin
    authProvider={authProvider}
    dataProvider={dataProvider}
    theme={{ ...defaultTheme, palette: { mode: "dark" } }}
  >
    <Resource
      name={USERS_SOURCE_NAME}
      list={UsersList}
      show={UsersShow}
      create={UsersCreate}
      edit={UsersEdit}
    />
    <Resource
      name={WATCHES_SOURCE_NAME}
      list={GoodsList}
      create={WatchesCreate}
      show={ProductShow}
      edit={WatchesEdit}
    />
    <Resource
      name={STRAPS_SOURCE_NAME}
      list={GoodsList}
      create={StrapsCreate}
      show={ProductShow}
      edit={StrapsEdit}
    />
    <Resource
      name={BOXES_SOURCE_NAME}
      list={GoodsList}
      create={BoxesCreate}
      show={ProductShow}
      edit={BoxesEdit}
    />
    <Resource
      name={CARE_SOURCE_NAME}
      list={GoodsList}
      create={CareCreate}
      show={ProductShow}
      edit={CareEdit}
    />
  </Admin>
);
