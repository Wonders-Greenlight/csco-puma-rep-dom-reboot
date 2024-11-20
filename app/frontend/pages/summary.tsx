import { Suspense, lazy } from "react";

const Stage = lazy(() => import("../ui_components/stage/default"));

export default function () {
    return <Suspense><Stage/></Suspense>
}