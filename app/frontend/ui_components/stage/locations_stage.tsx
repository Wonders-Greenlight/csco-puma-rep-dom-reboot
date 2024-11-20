import "./locations_stage.css";
import icon_0 from "../../assets/icon_09.svg";
import icon_1 from "../../assets/icon_10.svg";
import icon_2 from "../../assets/icon_11.svg";
import EventsNavigation from "../navigation/events_navigation";
import LocationsTable from "../table/locations_table";

import LocationForm from "../forms/location_form";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { FunctionComponent, useEffect, useState } from "react";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../../store/ConfigStore";
import { useAuthenticatedFetch } from "../../hooks";
import PageNavigation from "../navigation/pages_navigation";

export default function LocationsStage() {
  const fetcher = useAuthenticatedFetch();
  const [loggedIn, loggedInSetter] = useState(false);
  const [locations, locationsSetter] = useState(null);
  const [filter, filterSetter] = useState('Todas')
  const fetchConfig = () => ({
    headers: {
      "X-Innovate-Token": `Bearer ${state.sessionToken}`,
      "X-Innovate-Refresh-Token": state.refreshToken,
      "Content-Type": `application/json`,
    },
  });

  function handleCallback(name: string) {
    filterSetter(name)
  }

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

  const getLocations = async () => {
    try {
      const nowDate = new Date();
      // today.setUTCDate(today.getUTCDate() - 1)
      nowDate.setUTCHours(0);
      nowDate.setUTCMinutes(0);
      nowDate.setUTCSeconds(0);
      nowDate.setUTCMilliseconds(0);

      nowDate.setUTCDate(1);
      nowDate.setUTCMonth(nowDate.getUTCMonth() - 1);

      const query = {
        createdAt: {
          $gte: nowDate,
        },
      };

      const response = await fetcher(
        "/api/v1/locations?page=0",
        computeds.fetchConfig()
      );
      const data = await response.json();
      console.log(data);
      locationsSetter(data);

      // totalVariantsSetter(data.count);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      ConfigMethods.getConfig().then((e) => {
        // getVariantsCountNew();
        getLocations();

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
          getLocations();
          // const taskId = "66ef2cc8099341768a96bbd9";
          // taskState.taskId = taskId;
          // methods.getTask();
        });
      });
    }
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
    <div
      className="locations-stage"
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
          <EventsNavigation callback={handleCallback} labelsNames={["Todas","Activas", "Inactivas"]} />
          <LocationsTable />

          <div className="child-b outer-container">
            {locations ? (
              locations.filter((e: any) => {
                const conditions = {
                  'Activas': e.active === true,
                  'Inactivas': e.active === false,
                  'Todas': true,
                }
                return (conditions as any)[filter];
              }).map((e) => {
                const dateString = e.createdAt;
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
                console.log(e);
                const finalString = `Creada en: ${formattedDate}`;
                return (
                  <LocationCard
                    title={e.name}
                    subtitle={finalString}
                    _value={e}
                  />
                );
              })
            ) : (
              <span style={{ textAlign: "center" }}>Actualizando...</span>
            )}
          </div>
          <PageNavigation />
          <div className="summary-head child-a outer-container">
            <div className="content-container">
              <div className="title-text">Crear sucursal</div>
            </div>
          </div>
          <LocationForm />
        </div>
      </div>
    </div>
  );
}

type LocationCardProps = {
  title?: string;
  subtitle?: string;
  _value: any;
};
const LocationCard: FunctionComponent<LocationCardProps> = ({
  title = "Puma Calle El Conde 31",
  subtitle = "Created at: 7/1/2024, 2:39:47 PM",
  _value,
}) => {
  const navigate = useNavigate();

  function handleLink(link: string) {
    gsap.set(".body", {
      opacity: 0.5,
    });
    gsap.set(".body", {
      transform: "translateY(0px)",
    });

    // if (timeouts) {
    //   timeouts.push(timeoutid);
    // } else {
    //   timeouts = [timeoutid];
    // }

    navigate(link, { state: { data: _value } });
  }
  return (
    <div
      className="card-container"
      onClick={() => handleLink("/update/location")}
    >
      <div className="content-container">
        <div className="icon-container">
          <div className="icon">
            <img src={icon_0} alt="icon"  />
          </div>
        </div>

        <div className="text-content">
          <div className="title-container">
            <div className="title">{title}</div>
          </div>
          <div className="subtitle-container">
            <div className="subtitle">{subtitle}</div>
          </div>
        </div>
      </div>
      <div className="action-icon-container">
        <div className="action-icon">
          <img src={icon_2} alt="icon" />
        </div>
      </div>
    </div>
  );
};
