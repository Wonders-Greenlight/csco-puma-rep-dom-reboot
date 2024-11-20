import { useLocale, useNavigate } from "@shopify/app-bridge-react";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./detail_task_stage.css";
import PageNavigation from "../navigation/pages_navigation";
import search_icon from "../../assets/search_icon.svg";
import chevron from "../../assets/chevron_mark.svg";
import check from "../../assets/check_mark.svg";
import { useAuthenticatedFetch } from "../../hooks";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../../store/ConfigStore";

export interface ViewData {
  _id: string;
  type: string;
  filePath: string;
  fnToCall: string;
  priority: number;
  busId: string;
  args: Args;
  observations: string;
  state: string;
  innerData: string;
  microstateStatus: boolean;
  automated: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  startedAt: Date;
  finishedAt: Date;
  id: string;
}

export interface Args {
  pId: string;
  type: string;
}

export default function DetailTaskStage() {
  const location = useLocation();
  const data = (location.state && location.state.data) || {} as ViewData;
  const [loggedIn, loggedInSetter] = useState(false);
  const [task, taskSetter] = useState(null);
  const fetcher = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [success, successSetter] = useState(null);
  const [fail, failSetter] = useState(null);
  
  const fetchConfig = () => ({
    headers: {
      "X-Innovate-Token": `Bearer ${state.sessionToken}`,
      "X-Innovate-Refresh-Token": state.refreshToken,
      "Content-Type": `application/json`,
    },
  });

  const brandOptions = () => {
    return state.brands
      .filter(
        (brand) => !state.config.apiBrandIds?.includes(String(brand.Brand_Id))
      )
      .map((brand) => ({
        value: String(brand.Brand_Id),
        label: `${brand.StoreName} (${brand.Brand_Id})`,
      }));
  };

  const activeBrandOptions = () =>
    state.config.apiBrandIds?.map((bId) => {
      const thisBrand = state.brands.find(
        (x) => String(x.Brand_Id) === String(bId)
      );

      return thisBrand;
    }) || [];

  const computeds = {
    fetchConfig,
    brandOptions,
    activeBrandOptions,
  };

  const getTask = async () => {
    try {
      // const response = await fetcher('`/api/v1/tasks?page=1&query={}&limit=250&events=true`,', computeds.fetchConfig());
      const response = await fetcher(
        "/api/v1/tasks/" + data.id,
        computeds.fetchConfig()
      );
      const rdata = await response.json();
      // const { data } = await axios.get(
      //   `/api/shopify/products/count`,
      //   computeds.fetchConfig()
      // );

      console.log("totalVariantsSetter", rdata);
      taskSetter(rdata);
      successSetter(rdata.outerData && rdata.outerData.success )
      failSetter(rdata.outerData && rdata.outerData.failed )
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    
    if (loggedIn) {
      ConfigMethods.getConfig().then((e) => {
        // getVariantsCountNew();
        getTask();
        // const taskId = "66ef2cc8099341768a96bbd9";
        // taskState.taskId = taskId;
        // methods.getTask();
      });
    } else {
      ConfigMethods.signIn().then((e) => {
        console.log("SignIn", e);
        loggedInSetter(true);
        ConfigMethods.getConfig().then((e) => {
          // getVariantsCountNew();
          getTask();
          // const taskId = "66ef2cc8099341768a96bbd9";
          // taskState.taskId = taskId;
          // methods.getTask();
        });
      });
    }
  }, []);

  useEffect(() => {
    console.log("data", data.state);
    gsap.set(".body", {
      opacity: 0,
    });
    setTimeout(() => {
      gsap.killTweensOf(".body");
      gsap.set(".body", {
        opacity: 0.1,
      });
      gsap.set(".body", {
        transform: "translateY(5px)",
      });
      gsap.to(".body", {
        duration: 0.2, // Duration of the animation
        opacity: 1, // Final opacity
        y: 0, // Final position (move up to its original position)
        ease: "power4.out", // Natural easing function
      });
    }, 200);
  }, []);



  const dateString = data.createdAt;
  const date = new Date(dateString);

  // Format the date using toLocaleString
  const formattedDate = date.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const formattedDate1 = new Date(data.startedAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const formattedDate2 = new Date(data.finishedAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  // -----------------------------------------------------
  // Define two date objects
  const date1 = new Date(data.createdAt);
  const date2 = new Date(data.finishedAt);

  // Calculate the difference in milliseconds
  const diffInMs = date2 - date1;

  // Convert milliseconds to minutes
  const diffInMinutes = diffInMs / (1000 * 60);

  console.log(`Difference: ${diffInMinutes} minutes`);

  useEffect(() => {
    navigate("#")
  }, [])
  
  return (
    <div>
      {/* {JSON.stringify(data)} */}
      <div
        className="detail_task_stage"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0rem",
          width: "unset",
          justifyContent: "start",
          alignItems: "stretch",
          backgroundColor: "rgb(255,255,255)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0rem",
            width: "unset",
            justifyContent: "start",
            alignItems: "stretch",
            backgroundColor: "rgb(255,255,255)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0rem",
              width: "unset",
              justifyContent: "start",
              alignItems: "stretch",
            }}
          >
            <div
              style={
                {
                  // display: "flex",
                  // flexDirection: "row",
                  // gap: "0rem",
                  // width: "unset",
                  // justifyContent: "center",
                  // alignItems: "stretch",
                  // // padding: "1.25rem 10rem 1.25rem 10rem",
                  // boxSizing: "border-box",
                }
              }
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0rem",
                  height: "unset",
                  justifyContent: "start",
                  alignItems: "stretch",
                }}
              >
                <div className="child-a container">
                  <div className="title">
                    {{
                      CREATE_UPDATE_PRODUCTS:
                        "Creacion y/o actualizacion de productos",
                      UPDATE_PRICE: "Actualizar de precios",
                      UPDATE_STOCK: "Actualizar de stock",
                      CREATE_CUSTOMERS:
                        "Creacion y/o actualizacion de clientes y direcciones",
                    }[data.type] || data.type}{" "}
                    ID: {data.id}
                  </div>
                </div>
                <div className="child-b main-container">
                  <div className="sub-container">
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Rutina</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">
                          {data.automated ? "Si" : "No"}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Fecha Creacion:</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">
                          {formattedDate}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Fecha Inicio:</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">
                          {formattedDate1}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Fecha Finalizacion:</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">
                          {formattedDate2}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Tiempo Ejecucion:</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">{Math.floor(diffInMinutes)} minutos, {Math.floor((diffInMinutes * 60) % 60)} segundos </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="child-c main-container">
                  <div className="sub-container">
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">ID</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">{data.id}</div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Con exito</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">{success !== null ? success : 'Actualizando...'}</div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="column column-1">
                        <div className="label">Con error</div>
                      </div>
                      <div className="column column-2">
                        <div className="label-text">{fail !== null ? fail : 'Actualizando...'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="locations-stage-buttons-container">
                  <div className="child-e-locations outer-container">
                    {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
                    <div className="button-container">
                      <div className="create-button">
                        <div className="create-button-text">Ver detalles</div>
                      </div>
                      <div className="cancel-button">
                        <div className="cancel-button-text">Exportar</div>
                      </div>
                    </div>
                    <div className="spacer"></div>
                  </div>
                </div>

                {/* <div className="child-d container">
                  <div className="inner-container">
                    <div className="inner-column">
                      <div className="text">Exportar</div>
                    </div>
                  </div>
                </div> */}

                <div className="child-e outer-container">
                  <div className="inner-container">
                    <div className="row-container">
                      <div className="left-box">
                        <div className="left-box-column">
                          <img className="left-box-top" src={search_icon} />
                        </div>
                      </div>
                      <div className="right-box">
                        <div className="text">
                          Buscar recurso por ERP ID o SKU
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="child-f outer-container">
                  <div className="inner-container">
                    <div className="left-column">
                      <img className="left-top" src={check} />
                    </div>
                    <div className="center-column">
                      <div className="center-text">Filtros</div>
                    </div>
                    <div className="right-column">
                      <img className="right-top" src={chevron} />
                    </div>
                  </div>
                </div>

                <div className="child-g outer-container">
                  <div className="inner-container">
                    <div className="content-column">
                      <div className="header-row">
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="cell-text">Referencia / ERP ID</div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="cell-text">ID Recurso</div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="cell-text">Observaciones</div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="cell-text">Estado</div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="data-cell">Referencia1</div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="data-cell">ID1</div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="data-cell observation-cell-text">
                            Recently created
                          </div>
                        </div>
                        <div className="cell" style={{ width: "100%" }}>
                          <div className="status-container">
                            <div className="status-text">FINISHED</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <PageNavigation />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "0rem",
                height: "6.5rem",
                width: "unset",
                justifyContent: "center",
                alignItems: "stretch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0rem",
                  height: "unset",
                  width: "60rem",
                  justifyContent: "start",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                    height: "6.5rem",
                    width: "unset",
                    justifyContent: "start",
                    alignItems: "stretch",
                    padding: "2.5rem 1.25rem 2.5rem 1.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0rem",
                      height: "1.5rem",
                      width: "unset",
                      justifyContent: "start",
                      alignItems: "stretch",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "1rem",
                        lineHeight: "1.5rem",
                        fontWeight: "400",
                        color:
                          "rgb(160.64999878406525,130.0499975681305,73.94999787211418)",
                      }}
                    >
                      Copyright 2023 Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
