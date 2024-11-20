import { useEffect, useRef, useState } from "react";
import EntryInput from "../input/entry_input";
import EventsNavigation from "../navigation/events_navigation";

export default function RoutinesConfigModal() {
  const ref = useRef();
  useEffect(() => {
    document
      .querySelector("#routines-modal > div:nth-child(1) > div:nth-child(1)")
      .scrollTo(0, 0);
  }, []);
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0rem",
        // height: "5.5rem",
        width: "unset",
        justifyContent: "start",
        position: "relative",
        alignItems: "stretch",
        maxHeight: "75vh",
        overflowY: "scroll",
        paddingTop: "2.25rem",
        //   padding: "0.25rem 1rem 0.75rem 1rem",
      }}
    >
      <div
        className="summary-head child-a outer-container"
        style={{
          borderBottom: "0.0625rem solid #E5E8EB",
          position: "fixed",
          zIndex: "1500",
          left: 0,
          right: 0,
          top: 0,
          borderRadius: "1rem 1rem 0 0",
        }}
      >
        <div className="content-container">
          <div className="title-text">
            Configuración de intervalos para rutinas
          </div>
        </div>
      </div>

      {/* <div style={{ minHeight: "3.5875rem" }} /> */}
      <EntryInput
        title="Minutos de intervalo para tarea Actualización/Creación de Productos"
        placeholder="Minutos"
      />
      <EventsNavigation labelsNames={["Activo", "Inactivo"]} />
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "start",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          fontWeight: "400",
          color:
            "rgb(28.049999848008156,22.950000911951065,12.750000189989805)",
          padding: "0.75rem 1rem",
          boxSizing: "border-box",
        }}
      >
        Ingrese los minutos para la auto-ejecución repetida de esta tarea, si el
        estado activo está habilitado. La tarea de creación/actualización
        modifica productos con información del ERP, excepto precios e inventario
        en modo actualización.
      </div>
      <EntryInput
        title="Minutos de intervalo para tarea Actualización de Precios"
        placeholder="Minutos"
      />
      <EventsNavigation labelsNames={["Activo", "Inactivo"]} />
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "start",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          fontWeight: "400",
          color:
            "rgb(28.049999848008156,22.950000911951065,12.750000189989805)",
          padding: "0.75rem 1rem",
          boxSizing: "border-box",
        }}
      >
        Ingrese los minutos para la auto-ejecución repetida de esta tarea, si el
        estado activo está habilitado. La tarea de actualización de precios
        modifica solo los datos de precios de productos/variantes.
      </div>
      <EntryInput
        title="Minutos de intervalo para tarea Actualización de Stock"
        placeholder="Minutos"
      />
      <EventsNavigation labelsNames={["Activo", "Inactivo"]} />
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "start",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          fontWeight: "400",
          color:
            "rgb(28.049999848008156,22.950000911951065,12.750000189989805)",
          padding: "0.75rem 1rem",
          boxSizing: "border-box",
        }}
      >
        Ingrese los minutos para la auto-ejecución repetida de esta tarea, si el
        estado activo está habilitado. La tarea de actualización de stock
        modifica solo los datos de inventario de cada variante.
      </div>
      <div className="locations-stage-buttons-container">
        <div className="child-e outer-container">
          {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
          <div className="button-container">
            <a href="#" className="cancel-button">
              <div className="cancel-button-text">Descartar</div>
            </a>
            <div className="create-button">
              <div className="create-button-text">Aceptar</div>
            </div>
          </div>
          <div className="spacer"></div>
        </div>
      </div>
    </div>
  );
}
