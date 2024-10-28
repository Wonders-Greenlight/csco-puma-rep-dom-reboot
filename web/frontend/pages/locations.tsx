import { Suspense, lazy } from "react";

const LocationsStage = lazy(
  () => import("../ui_components/stage/locations_stage")
);

export default function () {
  return <Suspense><LocationsStage /></Suspense>;
}
