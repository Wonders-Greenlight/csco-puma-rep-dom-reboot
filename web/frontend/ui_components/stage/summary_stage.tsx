import gsap from "gsap";
import EventsNavigation from "../navigation/events_navigation";
import "./summary_stage.css";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  state as taskState,
  methods,
  computeds,
} from "../../store/TaskDetailsStore";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../../store/ConfigStore";
import { useAuthenticatedFetch } from "../../hooks";

export default function SummaryStage() {
  const [totalProducts, totalProductsSetter] = useState(0);
  const [totalVariants, totalVariantsSetter] = useState(0);
  const fetcher = useAuthenticatedFetch();
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

  const totalVariantsCount = async () => {
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
        "/api/shopify/variants/count",
        computeds.fetchConfig()
      );
      const data = await response.json();
      console.log(data);

      totalVariantsSetter(data.count);
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalProductsCount = async () => {
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
        "/api/shopify/products/count",
        computeds.fetchConfig()
      );
      const data = await response.json();
      // const { data } = await axios.get(
      //   `/api/shopify/products/count`,
      //   computeds.fetchConfig()
      // );

      console.log("totalVariantsSetter", data);
      totalProductsSetter(data.count);
    } catch (err: any) {
      console.error(err);
    }
  };

  const [loggedIn, loggedInSetter] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      ConfigMethods.getConfig().then((e) => {
        // getVariantsCountNew();
        totalVariantsCount();
        totalProductsCount();
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
          totalVariantsCount();
          totalProductsCount();
          // const taskId = "66ef2cc8099341768a96bbd9";
          // taskState.taskId = taskId;
          // methods.getTask();
        });
      });
    }
  });

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
    <div className="general-container">
      <div className="summary-stage section-container">
        <div className="empty-section">
          <div className="child-a outer-container">
            <div className="content-container">
              <div className="title-text">Bienvenido</div>
            </div>
          </div>
          <div className="child-b outer-container">
            <div className="text-content">
              {/* Bienvenido,
              <br />
              <br /> */}
              He aquí un resumen de las tareas procesadas en el plazo
              seleccionado:
            </div>
          </div>
          <EventsNavigation labelsNames={["Hoy", "Semana", "Mes"]} />
          <div className="child-d outer-container">
            <div className="content-container">
              <div className="title-container">
                <div className="title-text">Tareas procesadas: Hoy</div>
              </div>
              <div className="percentage-container">
                <div className="percentage-text">58.3%, 25.0%, 16.7%</div>
              </div>
            </div>
          </div>
          <div className="child-e outer-container">
            <div className="text-content">
              Actualización de stock, Creación y actualización de productos,
              Actualización de precios
            </div>
          </div>
          <div className="child-f outer-container">
            <div className="inner-container">
              <div className="content-container">
                <div className="title-container">
                  <div className="title-text">TOTAL DE PRODUCTOS:</div>
                </div>
                <div className="number-container">
                  <div className="number-text">
                    {totalProducts === 0 ? "Actualizando..." : totalProducts}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="child-f outer-container">
            <div className="inner-container">
              <div className="content-container">
                <div className="title-container">
                  <div className="title-text">TOTAL DE VARIANTES:</div>
                </div>
                <div className="number-container">
                  <div className="number-text">
                    {totalVariants === 0 ? "Actualizando..." : totalVariants}{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="large-container">
          <EventsNavigation labelsNames={["Hoy", "Semana", "Mes"]} />
          <div className="child-h outer-container">
            <div className="text-content">
              Eventos recibidos/enviados: Semana
              <br />
              <br />
              No existen registros aun.
            </div>
          </div>
          <div className="child-i spacer"></div>
        </div>
      </div>
    </div>
  );
}
