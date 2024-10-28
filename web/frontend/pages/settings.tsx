import { Suspense, lazy } from "react";

const SettingsStage = lazy(
    () => import("../ui_components/stage/settings_stage")
  );

export default function () {
    return <Suspense fallback={<>Loading</>}><SettingsStage/></Suspense>
}