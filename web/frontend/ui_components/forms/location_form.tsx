import SelectInput from "../input/select_input";
import icon_1 from "../../assets/icon_10.svg";
import EntryInput from "../input/entry_input";
import CheckInput from "../input/check_input";
import { useAxios } from "../../providers/utils";
import { Location as ShopifyLocation } from "../../interfaces/ShopifyInterfaces";
import {
  state as ConfigState,
  methods as ConfigMethods,
  // state,
} from "../../store/ConfigStore";
import { Fragment, useEffect, useRef, useState } from "react";
import EventsNavigation from "../navigation/events_navigation";
import gsap from "gsap";
import { useLocation } from "react-router-dom";
import IosCheckInput from "../input/ios_check_input";

interface locationFormParams {
  exist?: boolean;
}

export default function LocationForm(params: locationFormParams) {
  const [shopifyLocations, shopifyLocationsSetter] = useState([]);
  const [shopifyIdValue, shopifyIdValueSetter] = useState("");
  const [storeNameValue, storeNameValueSetter] = useState("");
  const ref = useRef();
  const { exist = false } = params;
  const location = useLocation();
  const { data } = location.state || { data: {}};

  function extractFormValues(
    formSelector: HTMLElement
  ): Record<string, string> | void {
    const data: Record<string, string> = {};

    // Get the specific form container by selector (formSelector)
    const formContainer = formSelector;
    console.log(formSelector);
    if (!formContainer) {
      console.error(`No form found with selector: ${formSelector}`);
      return;
    }

    // Extract select values within the form
    const selectElements =
      formContainer.querySelectorAll<HTMLSelectElement>("select");
    selectElements.forEach((select) => {
      const name = select.name || select.id;
      if (name) {
        data[name] = select.value;
      }
    });

    // Extract input values within the form
    const inputElements = formContainer.querySelectorAll<HTMLInputElement>(
      "input.input-container"
    );
    inputElements.forEach((input) => {
      const labelElement = input
        .closest(".content-container")
        ?.querySelector<HTMLElement>(".title");
      const label = labelElement?.innerText;
      if (label) {
        data[label] = input.value;
      }
    });

    console.log(data);
    return data;
  }

  function restoreFormValuesToDefault(formSelector: HTMLElement): void {
    // Get the specific form container by selector (formSelector)
    const formContainer = formSelector;

    if (!formContainer) {
      console.error(`No form found with selector: ${formSelector}`);
      return;
    }

    // Restore all select elements to their default value (first option or placeholder)
    const selectElements =
      formContainer.querySelectorAll<HTMLSelectElement>("select");
    selectElements.forEach((select) => {
      const firstOption = select.querySelector("option");
      if (firstOption) {
        select.value = ""; // Set to empty first
        if (firstOption.disabled) {
          // If first option is disabled (like a placeholder), reset to default
          select.selectedIndex = 0;
        } else {
          // Otherwise, set to first valid option
          select.value = firstOption.value;
        }
      }
    });

    // Restore input elements to their placeholder or empty value
    const inputElements = formContainer.querySelectorAll<HTMLInputElement>(
      "input.input-container"
    );
    inputElements.forEach((input) => {
      if (input.hasAttribute("placeholder")) {
        input.value = ""; // Clear input field
      } else {
        input.value = ""; // Fallback to empty
      }
      input.disabled = false; // If needed, reset to enabled
    });

    console.log(`Form values in ${formSelector} restored to defaults.`);
  }

  function restoreFormValues(
    formSelector: HTMLElement,
    values: Record<string, any>
  ): void {
    // Get the specific form container by selector (formSelector)
    const formContainer = formSelector;

    if (!formContainer) {
      console.error(`No form found with selector: ${formSelector}`);
      return;
    }

    // Restore all select elements to values from the provided object
    const selectElements =
      formContainer.querySelectorAll<HTMLSelectElement>("select");
    selectElements.forEach((select) => {
      const name = select.name || select.id;
      if (name && values[name]) {
        select.value = values[name];
      } else {
        select.selectedIndex = 0; // If no value provided, reset to first option
      }
    });

    // Restore input elements to values from the provided object
    const inputElements =
      formContainer.querySelectorAll<HTMLInputElement>("input");
    inputElements.forEach((input) => {
      const name = input.name || input.id; // Use name or id as the key
      if (name && values[name]) {
        input.value = values[name];
      } else {
        input.value = ""; // If no value provided, clear the field
      }
      input.disabled = false; // Optionally reset disabled state
    });

    console.log(`Form values in ${formSelector} restored from object.`);
  }

  function handleSubmitRefresh() {
    setTimeout(() => {
      gsap.set(".body", {
        opacity: 0,
      });

      window.scrollTo(0, 0);

      setTimeout(() => {
        gsap.killTweensOf(".body");
        gsap.set(".body", {
          opacity: 0.1,
          pointerEvents: 'all'
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

        setTimeout(() => {
          (window as any)['_dialog_opts'] = {
            title: "¡Todo listo!",
            msg:  location.pathname.includes("update") ? "La actualizacion se ha completado exitosamente." : "El registro se ha completado exitosamente.",
            action: "Continuar"
          }
          document.querySelector("#default-modal-app-ref").click();
        }, 250 + 357);

      }, 200);
    }, 357)
  }

  const handleSubmit = async () => {
    gsap.set(".body", {
      opacity: 0.5,
      // pointerEvents: 'none'
    });

    const _data = extractFormValues(ref.current) as any;
    // {
    //   "Shopify ID": "94513529016",
    //   "Store Name": "Shop location - null",
    //   "ERP ID": "23",
    //   "Email": "armasdqw"
    // }

    const _location = await useAxios({
      uri: location.pathname.includes("update") ? `/api/v1/locations/${(window as any)._location_id || data._id}`: `/api/v1/locations`,
      method: location.pathname.includes("update") ? "PUT" : "POST",
      payload: {
        name: _data["Store Name"],
        active: (document.querySelector('#active-container .active') && true) || false,
        shopifyId: _data["Shopify ID"],
        erpId: _data["ERP ID"],
        email: _data["Email"],
      },
    });

    // restoreFormValuesToDefault(ref.current);

    if (_location && _location.createdAt) {
     
      // window.location.reload();
    }

    window.scrollTo(0, 0);
    handleSubmitRefresh();

    console.log(_location);
    console.log(_data);
  };

  useEffect(() => {
    (window as any)._location_id = data._id;

    if (location.pathname.includes("update")) {
      console.log("location.pathname.includes('update')", data);
      restoreFormValues(ref.current, {
        Email: data.email,
        "Store Name": data.name,
        "Shopify ID": data.shopifyId,
        "Shopify locations": `${data.shopifyId},${data.name}`,
        "ERP ID": data.erpId,
        "active": data.active,
      });
    }

    setTimeout(() => {
      ConfigMethods.signIn().then((e) => {
        console.log("SignIn", e);
        ConfigMethods.getConfig().then((e) => {
          // getAnotherInfo();
          // getTask();
          // createNewTask();
          getShopifyLocations();
          // const taskId = '66f23ad362a24df80e2a4590'
          // taskState.taskId = taskId;
          // methods.getTask();
        });
      });
    }, 1000);
  }, []);

  const getShopifyLocations = async () => {
    // processing.value = true
    // const fetch = useAuthenticatedFetch()
    // const request = await fetch('/api/shopify/locations')

    // const spLocations = await request.json() as any[]
    try {
      const spLocations = await useAxios<any[]>({
        uri: "/api/v1/shopify/locations",
        method: "GET",
      });

      console.log(spLocations);

      const parsedLocations = spLocations.map((x) => ({
        ...x,
        label: `${x.name} - ${x.address1}`,
        value: String(x.id),
      }));

      // processing.value = false
      // shopifyLocations.value.splice(0, shopifyLocations.value.length, ...parsedLocations)
      shopifyLocationsSetter(parsedLocations);
      console.log(parsedLocations);
    } catch (ex) {}
  };

  const handleLocationUpdate = (value: any) => {
    const [id, label] = value.split(",");
    console.log(id, label, value);
    shopifyIdValueSetter(id);
    storeNameValueSetter(label);
  };

  return (
    <div ref={ref}>
      {!location.pathname.includes("update") && (
        <SelectInput
          listener={handleLocationUpdate}
          title="Shopify locations"
          options={[
            { value: "", title: "Selecciona una opcion" },
            ...shopifyLocations.map((e) => ({
              value: [e.id, e.name],
              title: e.name,
            })),
          ]}
        />
      )}
      <EntryInput
        computedValue={shopifyIdValue}
        title="Shopify ID"
        placeholder="Please select from a location above"
        disabled={true}
      />
      <EntryInput
        computedValue={storeNameValue}
        title="Store Name"
        placeholder="Please select from a location above"
        disabled={true}
      />
      <EntryInput title="ERP ID" placeholder="ID" />
      <EntryInput title="Email" placeholder="Email" />

      <div className="locations-stage child-d outer-container">
        <div className="content-container">
          <IosCheckInput title="active" placeholder="Activa" computedValue={data.active} />
        </div>
      </div>
      {/* <CheckInput /> */}
      <div className="locations-stage-buttons-container">
        <div className="child-e outer-container">
          {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
          <div className="button-container">
            {/* {exist && <div className="create-button" onMouseUp={handleSubmit}>
              <div className="create-button-text">
                Eliminar
              </div>
            </div>} */}
            <div className="create-button" onMouseUp={handleSubmit}>
              <div className="create-button-text">
                {exist ? "Actualizar" : "Aceptar"}
              </div>
            </div>
            <div className="cancel-button">
              <div className="cancel-button-text">Cancelar</div>
            </div>
          </div>
          <div className="spacer"></div>
        </div>
      </div>
    </div>
  );
}
