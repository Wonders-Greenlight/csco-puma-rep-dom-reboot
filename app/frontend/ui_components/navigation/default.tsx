import { useAppBridge, useNavigate } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import "./default.css";
import {
  mouseOutButton,
  mouseOutCard,
  mouseOverButton,
  mouseOverCard,
} from "../../utils/events";
import gsap from "gsap";
import { useLocation, useNavigation } from "react-router";
import { Redirect } from "@shopify/app-bridge/actions";
// import { Redirect } from '@shopify/app-bridge/actions';
// const handleNavigation = () => {
//   redirect.dispatch(Redirect.Action.APP, '/your-new-url');
// };
export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const redirect = Redirect.create(appBridge);
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);

  const [currentWindow, currentWindowSetter] = useState("/summary");
  var cleanup: () => void = () => {};
  var timeouts: NodeJS.Timeout[] = [];

  function handleLink(link: string) {
    timeouts.forEach((e) => clearTimeout(e));
    timeouts = [];

    // if (timeouts) {
    //   timeouts.push(timeoutid);
    // } else {
    //   timeouts = [timeoutid];
    // }

    currentWindowSetter(link);
    // console.log(link + "?host="+sessionStorage.getItem('host'))
    console.log(location.pathname);
    console.log(link);
    console.log(location.pathname !== link);
    console.log(link + "?host=" + sessionStorage.getItem("host"));
    if (location.pathname !== link) {
      gsap.set(".body", {
        opacity: 0,
      });
      // gsap.set(".body", {
      //   transform: "translateY(0px)",
      // });

      window.scrollTo(0, 0);
      navigate(link + "?host=" + sessionStorage.getItem("host"));
    }
  }

  function cleanupMotionEvents(
    allButtons: NodeListOf<HTMLElement>,
    allCardTitles: NodeListOf<HTMLElement>
  ) {
    allButtons.forEach((button) => {
      button.removeEventListener("mouseover", () => mouseOverButton(button));
      button.removeEventListener("mouseout", () => mouseOutButton(button));
    });

    allCardTitles.forEach((cardTitle) => {
      const cardParent = cardTitle;

      if (cardParent) {
        cardParent.removeEventListener("mouseover", () =>
          mouseOverCard(cardTitle, cardParent)
        );
        cardParent.removeEventListener("mouseout", () =>
          mouseOutCard(cardTitle, cardParent)
        );
      }
    });
  }

  function handleMotionEvents(
    allButtons: NodeListOf<HTMLElement>,
    allCardTitles: NodeListOf<HTMLElement>
  ) {
    allButtons.forEach((button) => {
      button.addEventListener("mouseover", () => mouseOverButton(button));
      button.addEventListener("mouseout", () => mouseOutButton(button));
    });

    allCardTitles.forEach((cardTitle) => {
      const cardParent = cardTitle.parentElement?.parentElement;

      if (cardParent) {
        cardParent.addEventListener("mouseover", () =>
          mouseOverCard(cardTitle, cardParent)
        );
        cardParent.addEventListener("mouseout", () =>
          mouseOutCard(cardTitle, cardParent)
        );
      }
    });
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  useEffect(() => {
    cleanup();

    // Set the state to false while the new route is loading
    setIsRouteLoaded(false);

    // Check if navigation is finished, meaning the new route is fully loaded
    // if (navigation.state === "idle") {
    //   setIsRouteLoaded(true);
    // }

    const allCardTitles =
      document.querySelectorAll<HTMLElement>(".app-card-title");
    const allButtons = document.querySelectorAll<HTMLElement>(".app-button");

    if (isRouteLoaded) {
      // console.log(navigation.state)
      // gsap.killTweensOf(".body");
      // gsap.set(".body", {
      //   opacity: 0.1,
      // });
      // gsap.set(".body", {
      //   transform: "translateY(50px)",
      // });
      // gsap.to(".body", {
      //   duration: 0.2, // Duration of the animation
      //   opacity: 1, // Final opacity
      //   y: 0, // Final position (move up to its original position)
      //   ease: "power1.out", // Natural easing function
      // });

      handleMotionEvents(allButtons, allCardTitles);
    }

    cleanup = () => {
      cleanupMotionEvents(allButtons, allCardTitles);
    };

    return cleanup;
  }, [location, isRouteLoaded]);

  return (
    <div className="default-navigation main-container locations-stage-buttons-container">
      <div className="row-container">
        {/* <div
          className="column-container"
          onMouseUp={() => handleLink("/summary")}
        >
          <div className="text-container">
            <div
              style={{
                color:
                  currentWindow === "/summary"
                    ? "rgb(28.05, 22.95, 12.75)"
                    : "",
              }}
              className={
                "text text-locations " +
                (currentWindow === "/summary" ? "" : "app-card-title")
              }
            >
              Summary
            </div>
          </div>
        </div> */}
        <div
          className="button-flat column-container"
          onMouseUp={() => handleLink("/locations")}
        >
          <div className="text-container">
            <div
              style={{
                color:
                  currentWindow === "/locations"
                    ? "rgb(28.05, 22.95, 12.75)"
                    : "",
              }}
              className={
                "text text-locations " +
                (currentWindow === "/locations" ? "" : "app-card-title")
              }
            >
              Sucursales
            </div>
          </div>
        </div>

        <div
          className="button-flat column-container"
          onMouseUp={() => handleLink("/events")}
        >
          <div className="text-container">
            <div
              style={{
                color:
                  currentWindow === "/events" ? "rgb(28.05, 22.95, 12.75)" : "",
              }}
              className={
                "text text-events " +
                (currentWindow === "/events" ? "" : "app-card-title")
              }
            >
              Eventos
            </div>
          </div>
        </div>
        <div
          className="button-flat column-container"
          onMouseUp={() => handleLink("/tasks")}
        >
          <div className="text-container">
            <div
              style={{
                color:
                  currentWindow === "/tasks" ? "rgb(28.05, 22.95, 12.75)" : "",
              }}
              className={
                "text text-tasks " +
                (currentWindow === "/tasks" ? "" : "app-card-title")
              }
            >
              Tareas
            </div>
          </div>
        </div>
        <div
          className="button-flat column-container"
          onMouseUp={() => handleLink("/settings")}
        >
          <div className="text-container">
            <div
              style={{
                color:
                  currentWindow === "/settings"
                    ? "rgb(28.05, 22.95, 12.75)"
                    : "",
              }}
              className={
                "text text-settings " +
                (currentWindow === "/settings" ? "" : "app-card-title")
              }
            >
              Ajustes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
