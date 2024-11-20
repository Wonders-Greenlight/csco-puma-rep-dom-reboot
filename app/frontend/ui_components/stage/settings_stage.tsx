import "./settings_stage.css";
import icon_12 from "../../assets/icon_12.svg";
import icon_13 from "../../assets/icon_13.svg";
import icon_14 from "../../assets/icon_14.svg";
import icon_15 from "../../assets/icon_15.svg";
import EventsNavigation from "../navigation/events_navigation";
import gsap from "gsap";

import { useFetch } from "../../providers/ShopifyApp";
import { useEffect } from "react";
// Interfaces
import {
  BADGE_DICTIONARY,
  ITask,
  TYPE_NAME_DICTIONARY,
  TaskPriority,
  TaskState,
  TaskType,
  TaskTypes,
} from "../../interfaces/TaskInterfaces";
import {
  TOAST_REASON,
  TOAST_REASON_RESULT,
  ToastReason,
} from "../../interfaces/AppInterfaces";
import { ClientApplication } from "@shopify/app-bridge-core/client/types";
import SocketStore from "../../store/SocketStore";
import { state as NavigationState } from "../../store/NavigationStore";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../../store/ConfigStore";
import { methods as ShopifyMethods } from "../../store/ShopifyAppStore";
import { isEmpty, useAxios, debounce } from "../../providers/utils";
import axios from "axios";

import {
  state as taskState,
  methods,
  computeds,
} from "../../store/TaskDetailsStore";
import { useAuthenticatedFetch } from "../../hooks";
import EntryInput from "../input/entry_input";
import SelectInput from "../input/select_input";
import IosCheckInput from "../input/ios_check_input";
import { IAppConfig } from "../../interfaces/ResourceInterfaces";

export default function SettingsStage() {

  const fetchConfig = () => ({
    headers: {
      Authorization: `Bearer ${state.sessionToken}`,
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
  
  useEffect(() => {
    ConfigMethods.signIn().then((e) => {
      console.log("SignIn", e);
      ConfigMethods.getConfig().then((e:IAppConfig ) => {
        console.log("getConfig")
        console.log(ConfigState)
        // getVariantsCountNew();
        // getAnotherInfo();
        // getTasks();
        ConfigMethods.getConfig().then(e => {
          console.log("getConfig")
          console.log(ConfigState.config)
        });
        const taskId = "66ef2cc8099341768a96bbd9";
        taskState.taskId = taskId;
        // methods.getTask();
      });
    });
  }, []);



  useEffect(() => {
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
  return (
    <div className="settings-stage">
      <div className="settings-stage-inner">
        <div className="settings-stage-content">
          {/* <div className="child-c order-paid-container">
            <div className="order-paid-left">
              <div className="order-paid-icon">
                <div className="order-paid-icon-inner">
                  <div className="order-paid-icon-fill">
                    <img src={icon_13} />
                  </div>
                </div>
              </div>
              <div className="order-paid-details">
                <div className="order-paid-title">ORDERS_PAID</div>
                <div className="order-paid-urls">1 Activas URLs</div>
              </div>
            </div>
            <div className="order-paid-edit">
              <div className="order-paid-edit-button">
                <div className="order-paid-edit-text">Editar</div>
              </div>
            </div>
          </div> */}
          <div className="child-d global-settings-container">
            <div className="global-settings-title">Global Settings</div>
          </div>
          <SelectInput
            title="App Language"
            name="app_language_select"
            options={[
              { value: "", title: "Selecciona una opcion" },
              {
                title: "ESP",
                value: "ESP",
              },
              {
                title: "ENG",
                value: "ENG",
              },
              // {
              //   title: "Creacion y/o actualizacion de clientes y direcciones",
              //   value: "CREATE_CUSTOMERS",
              // },
            ]}
          />
          <SelectInput
            title="Mode"
            name="app_mode_select"
            options={[
              { value: "", title: "Selecciona una opcion" },
              {
                title: "Sandbox",
                value: "Sandbox",
              },
              {
                title: "Produccion",
                value: "Produccion",
              },
              // {
              //   title: "Creacion y/o actualizacion de clientes y direcciones",
              //   value: "CREATE_CUSTOMERS",
              // },
            ]}
          />

          <EntryInput title="Sandbox API URL" computedValue={ConfigState.config.apiSandboxUrl} placeholder="Sandbox API URL" />
          <EntryInput title="Sandbox API KEY" computedValue={ConfigState.config.apiSandboxKey} placeholder="Sandbox API KEY" />
          <EntryInput title="Production API URL" computedValue={ConfigState.config.apiProductionUrl} placeholder="Production API URL" />
          <EntryInput title="Production API KEY" computedValue={ConfigState.config.apiProductionKey} placeholder="Production API KEY" />
          <EntryInput title="DB Name" computedValue={ConfigState.config.dbName} placeholder="DB Name" />
          <EntryInput title="DB Name Orders" computedValue={ConfigState.config.dbOrdersName} placeholder="DB Name Orders" />
          <EntryInput title="DB Username" computedValue={ConfigState.config.dbUserName} placeholder="DB Username" />
          <EntryInput title="DB Password" computedValue={ConfigState.config.dbPassword} placeholder="DB Password" />
          <SelectInput
            title="Product creation mode (default status)"
            name="app_language_select"
            options={[
              { value: "", title: "Selecciona una opcion" },
              {
                title: "Safe",
                value: "Safe",
              },
              {
                title: "Override",
                value: "Override",
              },
            ]}
          />

          <div className="locations-stage-buttons-container">
            <div className="child-e outer-container">
              {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
              <div className="button-container">
                <div className="create-button">
                  <div className="create-button-text">Aceptar y actualizar</div>
                </div>
              </div>
              <div className="spacer"></div>
            </div>
          </div>

          <div className="child-g tasks-related-container">
            <div className="tasks-related-title">Tasks Related</div>
          </div>
          
          <EventsNavigation labelsNames={["Activada", "Desactivada"]} />
          {/* <div className="child-i web-item-row">
            <div className="web-item-left">
              <div className="web-item-icon-container">
                <div className="web-item-icon-content">
                  <div className="web-item-icon-bar">
                    <img src={icon_14} />
                  </div>
                  <div className="spacer"></div>
                </div>
              </div>
              <div className="web-item-text-container">
                <div className="web-item-text">
                  Retrieve only WebItem products
                </div>
              </div>
            </div>
            <div className="web-item-switch-container">
              <div
                className="web-item-switch-outer"
                onMouseUp={(ev) => handleEffect(ev)}
              >
                <div
                  className="web-item-switch-inner"
                  style={{ pointerEvents: "none" }}
                ></div>
              </div>
            </div>
          </div> */}
          <div className="locations-stage child-d outer-container">
            <div className="content-container" style={{margin: '0rem -1rem'}}>
              <IosCheckInput
                title="Retrieve only available inventories (Stock)"
                placeholder="Retrieve only available inventories (Stock)"
                computedValue={ConfigState.config.productRetrieveOnlyAvailable}
              />
            </div>
          </div>

          <div className="locations-stage child-d outer-container">
            <div className="content-container" style={{margin: '0rem -1rem'}}>
              <IosCheckInput
                title="Retrieve only WebItem products"
                placeholder="Retrieve only WebItem products"
                computedValue={ConfigState.config.productRetrieveOnlyWebItem}
              />
            </div>
          </div>
      
      
         
        </div>
      </div>
    </div>
  );
}
