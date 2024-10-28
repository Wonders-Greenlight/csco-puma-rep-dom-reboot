import { Suspense, lazy } from "react";

const LocationsStage = lazy(
  () => import("../ui_components/stage/default")
);

export default function () {
  return <Suspense><LocationsStage /></Suspense> ;
}
