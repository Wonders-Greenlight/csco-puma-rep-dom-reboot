import { BrowserRouter, Outlet } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import {
  AppBridgeProvider,
  PolarisProvider,
  QueryProvider,
} from "./components";

import Heading from "./ui_components/heading/default";
import React, { Suspense, useRef, useState } from "react";
import Navigation from "./ui_components/navigation/default";
import GoBackNavigation from "./ui_components/navigation/goback_navigation";
import gsap from "gsap";
import ExitIframe from "./pages/ExitIframe";
import { NavigationMenu } from "@shopify/app-bridge-react";
import LocationForm from "./ui_components/forms/location_form";
import "./app.css";
import DefaultLoader from "./ui_components/loader/default";

import UpdateLocationStage from "./ui_components/stage/update_location_stage";
import SummaryStage from "./ui_components/stage/summary_stage";
import EventsStage from "./ui_components/stage/default";
import LocationStage from "./ui_components/stage/locations_stage";
import SettingsStage from "./ui_components/stage/settings_stage";
import TaskStage from "./ui_components/stage/tasks_stage";
import DetailTaskStage from "./ui_components/stage/detail_task_stage";
import RoutinesConfigModal from "./ui_components/modal/config_modal";
import DefaultModal from "./ui_components/modal/default";

function Layout() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  // const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  const [preservedView, setPreservedView] = useState(null);
  const ref = useRef();
  var timeouts: NodeJS.Timeout[] = [];

  function handleMount() {
    // timeouts.forEach((e) => clearTimeout(e));
    // timeouts = [];
    // gsap.set(".body", {
    //   opacity: 0,
    // });
    // Clear preserved view when location changes
    // setTimeout(() => {
    //   setPreservedView(ref.current);
    // },1000)
  }
  return (
    <>
      {/* <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                zIndex: -50,
                pointerEvents: "none",
              }}
              dangerouslySetInnerHTML={{
                __html: preservedView && preservedView.innerHTML,
              }}
            /> */}
      <div
        className="body"
        style={{ backgroundColor: "#FFFFFF", minHeight: "100vh" }}
      >
        <Outlet />
        {/* <DefaultLoader init={handleMount} /> */}
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      {" "}
      <PolarisProvider>
        <BrowserRouter>
          <AppBridgeProvider>
            <QueryProvider>
              <div
                style={{
                  height: "calc(12.0625rem)",
                  backgroundColor: "#FFFFFF",
                }}
              />
         
              <div className="fixed-navbar card-0">
                <GoBackNavigation />
                <Heading />
                <Navigation></Navigation>
                <NavigationMenu
                  navigationLinks={[
                    {
                      label: "Sucursales",
                      destination: "/locations",
                    },
                    {
                      label: "Eventos",
                      destination: "/events",
                    },
                    {
                      label: "Tareas",
                      destination: "/tasks",
                    },
                    {
                      label: "Ajustes",
                      destination: "/settings",
                    },
                  ]}
                />
              </div>
              <Routes>
                {/* Route for exiting the iframe */}
                <Route path="/exitframe" element={<ExitIframe />} />

                {/* Main layout wrapper for the app */}
                <Route path="/" element={<Layout />}>
                  {/* Index route for the main summary */}
                  <Route index element={<SummaryStage />} />
                  {/* Additional nested routes */}
                  <Route path="events" element={<EventsStage />} />
                  <Route path="locations" element={<LocationStage />} />
                  <Route path="settings" element={<SettingsStage />} />
                  <Route path="tasks" element={<TaskStage />} />
                  <Route path="summary" element={<SummaryStage />} />
                </Route>

                {/* Separate update route nested under Layout */}
                <Route path="/update" element={<Layout />}>
                  <Route path="location" element={<UpdateLocationStage />} />
                </Route>
                <Route path="/detail" element={<Layout />}>
                  <Route path="task" element={<DetailTaskStage />} />
                </Route>
              </Routes>
            </QueryProvider>
          </AppBridgeProvider>
          <DefaultModal />
          <DefaultModal type="a" name={'routines-modal'}>
            <RoutinesConfigModal />
          </DefaultModal>
        </BrowserRouter>
      </PolarisProvider>
      
    </>
  );
}
