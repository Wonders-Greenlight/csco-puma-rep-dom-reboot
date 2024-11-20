import { Suspense, lazy } from "react";

const TasksStage = lazy(() => import("../ui_components/stage/tasks_stage"));
export default function () {
    return <Suspense><TasksStage/></Suspense>
}