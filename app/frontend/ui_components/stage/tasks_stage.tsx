import "./tasks_stage.css";
import EventsNavigation from "../navigation/events_navigation";
import icon_5 from "../../assets/icon_05.svg";
import icon_8 from "../../assets/icon_08.svg";
import icon_10 from "../../assets/icon_10.svg";
import icon_3 from "../../assets/icon_03.svg";
import SelectInput from "../input/select_input";
import { useEffect, useState } from "react";
import gsap from "gsap";
import {
  state as ConfigState,
  methods as ConfigMethods,
  state,
} from "../../store/ConfigStore";
import { useAuthenticatedFetch } from "../../hooks";
import PageNavigation from "../navigation/pages_navigation";
import { useLocation, useNavigate } from "react-router-dom";
import { TaskType } from "../../interfaces/TaskInterfaces";
import { TaskPriority } from "../../interfaces/TaskInterfaces";
import DefaultModal from "../modal/default";
import EntryInput from "../input/entry_input";

export default function TasksStage() {
  const [loggedIn, loggedInSetter] = useState(false);
  const [tasks, tasksSetter] = useState(null);
  const loc = useLocation();
  const fetcher = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [action, actionSetter] = useState('Crear tarea');
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
            msg: "El registro se ha completado exitosamente.",
            action: "Continuar"
          }
          document.querySelector("#default-modal-app-ref").click();
        }, 250 + 357);

      }, 200);
    }, 357)
  }
  function handleCallbacks(name: string) {
    actionSetter(name);
  }
  function handleLink(link: string, _value: any) {
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

  const createTask = async () => {
    try {

      const t: any = {
        CREATE_UPDATE_PRODUCTS: TaskType.CREATE_UPDATE_PRODUCTS,
        UPDATE_STOCK: TaskType.UPDATE_STOCK,
        UPDATE_PRICE: TaskType.UPDATE_PRICE,
        // CREATE_CUSTOMERS: TaskType.CREATE_CUSTOMERS,
      }
      const payload: any = {
        type: t[(document.querySelector('.select-box') as any).value],
        priority: TaskPriority.HIGH,
        automated: false,
        
      };

      if (action === 'Agendar tarea') {
        payload.schedule = new Date((document.querySelector("input[name=Fecha]") as any).value).toISOString();
      }

      console.log('new task')
      console.log(payload);
      // if (!!schedule && scheduleState.value !== todayDate) {
      //   payload.schedule = new Date(scheduleState.value).toISOString();
      // }

      // const { data } = await useAxios({
      //   method: "POST",
      //   uri: "/api/v1/tasks",
      //   payload,
      // });

      // const response = await fetcher('`/api/v1/tasks?page=1&query={}&limit=250&events=true`,', computeds.fetchConfig());
      const response = await fetcher("/api/v1/tasks", {
        method: "POST",
        ...computeds.fetchConfig(),
        body: JSON.stringify(payload),
      });



      const data = await response.json();
      // const { data } = await axios.get(
      //   `/api/shopify/products/count`,
      //   computeds.fetchConfig()
      // );

      console.log("totalVariantsSetter", data);
    } catch (err: any) {
      console.error(err);
    } finally {
      await getTasks();
      handleSubmitRefresh();

      // window.location.reload();
    }
  };

  const getTasks = async () => {
    try {


      // const response = await fetcher('`/api/v1/tasks?page=1&query={}&limit=250&events=true`,', computeds.fetchConfig());
      const response = await fetcher(
        "/api/v1/tasks?page=0&limit=10&events=true",
        computeds.fetchConfig()
      );
      const data = await response.json();
      // const { data } = await axios.get(
      //   `/api/shopify/products/count`,
      //   computeds.fetchConfig()
      // );

      console.log("totalVariantsSetter", data);
      tasksSetter(data);
    } catch (err: any) {
      console.error(err);
    }
  };


  useEffect(() => {
    if (loggedIn) {
      ConfigMethods.getConfig().then((e) => {
        // getVariantsCountNew();
        getTasks();
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
          getTasks();
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

  function formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
  
    let result = "";
  
    if (hours > 0) {
      result += hours === 1 ? `${hours} hora` : `${hours} horas`;
    }
  
    if (remainingMinutes > 0) {
      if (result) {
        result += " ";
      }
      result += remainingMinutes === 1 ? `${remainingMinutes} minuto` : `${remainingMinutes} minutos`;
    }
  
    return result || "0 minutos";
  }

  return (
    <div
      className="tasks-stage"
      style={{
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
        <div className="child-a outer-container">
          <div className="button-container button-type">
            <div className="button-content">
              <img className="icon-background" src={icon_8} />
            </div>
            <div className="button-label">Tipo</div>
            <div className="button-content">
              <img className="icon-background" src={icon_5} />
            </div>
          </div>

          <div className="button-container button-filters">
            <div className="button-label">Mas filtros</div>
            <div className="button-content">
              <img className="icon-background" src={icon_5} />
            </div>
          </div>
        </div>
        <div className="child-b progress-container">
          <div className="progress-row">
            <div className="label-container">
              <div className="label-text">Progreso de tasks</div>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill"></div>
          </div>
        </div>
        {tasks ? (
          tasks.map((e, i) => {
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
            // -----------------------------------------------------
            // Define two date objects
            const date1 = new Date(e.createdAt);
            const date2 = new Date(e.finishedAt);

            // Calculate the difference in milliseconds
            const diffInMs = date2 - date1;

            // Convert milliseconds to minutes
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            console.log(diffInMinutes)
            console.log(`Difference: ${diffInMinutes} minutes`);
            return (
              <div
                onMouseUp={() => handleLink("/detail/task", e)}
                className={
                  i % 2 == 0 ? "child-c row-container" : "child-d row-container"
                }
              >
                <div className="content-container">
                  <div className="icon-container">
                    <div className="icon-content">
                      <img className="inner-icon" src={icon_3} />
                    </div>
                  </div>
                  <div className="text-container">
                    <div className="task-title">
                      {({
                        CREATE_UPDATE_PRODUCTS:
                          "Creacion y/o actualizacion de productos",
                        UPDATE_PRICE: "Actualizar de precios",
                        UPDATE_STOCK: "Actualizar de stock",
                      } as any)[e.type] || e.type}
                    </div>
                    <div className="task-details">{finalString}</div>
                  </div>
                </div>
                <div className="duration-container">
                  <div className="duration-text">{diffInMinutes ? formatTime(diffInMinutes) : ({'SCHEDULED': 'Agendada','FINISHED': 'Completada','PROCESSING': 'En progreso','CANCELLED': 'Cancelada','ON_HOLD': 'En espera'} as any)[e.state]}</div>
                </div>
              </div>
            );
          })
        ) : (
          <span style={{ textAlign: "center" }}>Actualizando...</span>
        )}
        <PageNavigation />
        {/* <div className="child-d row-container">
          <div className="content-container">
            <div className="icon-container">
              <img className="inner-icon" src={icon_3} />
            </div>
            <div className="text-container">
              <div className="task-title">Create/Update products</div>
              <div className="task-details">
                Processing, Created at 9/11/2024, 7:00 PM
              </div>
            </div>
          </div>
          <div className="duration-container">
            <div className="duration-text">75m</div>
          </div>
        </div> */}
        <div className="locations-stage-buttons-container">
          <div className="child-e outer-container">
            {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
            <div className="button-container">
        
              <a href="#routines-modal" className="create-button" onMouseDown={() => {
                document
                .querySelector("#routines-modal > div:nth-child(1) > div:nth-child(1)")
                .scrollTo(0, 0);
              }} >
                <div className="create-button-text" >Configurar rutinas</div>
              </a>
            </div>
            <div className="spacer"></div>
          </div>
        </div>

        <div className="summary-head child-a outer-container">
          <div className="content-container">
            <div className="title-text">Crear/Agendar tarea</div>
          </div>
        </div>
        {/* <EventsNavigation labelsNames={["Crear tarea", "Agendar tarea"]} /> */}
        <EventsNavigation callback={handleCallbacks} labelsNames={["Crear tarea", "Agendar tarea"]} />
        {/* <div className="settings-stage-child-e sandbox-container">
          <div className="sandbox-inner">
            <div className="sandbox-title">
              <div className="sandbox-text">Sandbox API URL</div>
            </div>
            <input className="sandbox-input sandbox-text" />
          </div>
        </div> */}
        {/* <option disabled="" value="">
              Selecciona una opcion
            </option>
            <option value="CREATE_UPDATE_PRODUCTS">
              Creacion y/o actualizacion de productos
            </option>
            <option value="UPDATE_PRICE">Actualizacion de precios</option>
            <option value="UPDATE_STOCK">Actualizacion de stock</option>
            <option value="CREATE_CUSTOMERS">
              Creacion y/o actualizacion de clientes y direcciones
            </option> */}
        { action === 'Agendar tarea' && <EntryInput  title="Fecha" placeholder="Today 3:00 PM" type="datetime-local" />}
        <SelectInput title="Tarea" name="task_stage_new_task_select"
          options={[
            { value: "", title: "Selecciona una opcion" },
            {
              title: "Creacion y/o actualizacion de productos",
              value: "CREATE_UPDATE_PRODUCTS",
            },
            {
              title: "Actualizacion de precios",
              value: "UPDATE_PRICE",
            },
            {
              title: "Actualizacion de stock",
              value: "UPDATE_STOCK",
            },
            // {
            //   title: "Creacion y/o actualizacion de clientes y direcciones",
            //   value: "CREATE_CUSTOMERS",
            // },
          ]}
        />
        <div className="locations-stage-buttons-container">
          <div className="child-e outer-container">
            {/* <EventsNavigation labelsNames={["Activa", "Inactiva"]} /> */}
            <div className="button-container">
              <div className="create-button" onMouseUp={() => {
                gsap.set(".body", {
                  opacity: 0.5,
                  pointerEvents: 'none'
                });

                createTask();

              }}>
                <div className="create-button-text">Aceptar</div>
              </div>
              <div className="cancel-button">
                <div className="cancel-button-text">Cancelar</div>
              </div>
            </div>
            <div className="spacer"></div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
