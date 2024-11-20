import "./default.css";

import icon_3 from "../../assets/icon_03.svg";
import icon_4 from "../../assets/icon_04.svg";
import icon_5 from "../../assets/icon_05.svg";
import icon_6 from "../../assets/icon_06.svg";
import icon_7 from "../../assets/icon_07.svg";
import EventsNavigation from "../navigation/events_navigation";
import gsap from "gsap";
import { useEffect } from "react";

export default function Stage() {

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
    }, 200)
  }, []);

  return (
    <div
      className="events-stage"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0rem",
        // height: "52.75rem",
        width: "unset",
        justifyContent: "space-between",
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
        <EventsNavigation labelsNames={["Recientes", "Sucursales", "Historial"]} />
        {/* <div className="child-b outer-container">
          <div className="bar bar-active"></div>
          <div className="bar bar-inactive"></div>
          <div className="bar bar-inactive"></div>
        </div> */}
        {/* <div className="child-c outer-container">
          <div className="inner-container">
            <div className="button button-create">
              <div className="text">Create Event</div>
            </div>
            <div className="button button-schedule">
              <div className="text">Schedule Event</div>
            </div>
          </div>
        </div> */}
        <span style={{textAlign: 'center'}}>No existen eventos por el momento</span>
        {/* <div className="child-d outer-container">
          <div className="left-container">
            <div className="icon-container">
              <img className="inner-icon" src={icon_3} />
            </div>
            <div className="content-container">
              <div className="title">Stock Update</div>
              <div className="description">Duration: 23m</div>
              <div className="description">11/29/2024, 19:16:24</div>
            </div>
          </div>
          <div className="right-container">
            <div className="status">Finished</div>
          </div>
        </div>
        <div className="child-e outer-container">
          <div className="left-container">
            <div className="icon-container">
              <img className="inner-icon" src={icon_3} />
            </div>
            <div className="content-container">
              <div className="title">Create/Update Products</div>
              <div className="description">Duration: 7m 35s</div>
              <div className="description">9/11/2024, 7:00:00 PM</div>
            </div>
          </div>
          <div className="right-container">
            <div className="status">Processing</div>
          </div>
        </div>
        <div className="child-d outer-container">
          <div className="left-container">
            <div className="icon-container">
              <img className="inner-icon" src={icon_3} />
            </div>
            <div className="content-container">
              <div className="title">Stock Update</div>
              <div className="description">Duration: 23m</div>
              <div className="description">11/29/2024, 19:16:24</div>
            </div>
          </div>
          <div className="right-container">
            <div className="status">Finished</div>
          </div>
        </div>
        <div className="child-e outer-container">
          <div className="left-container">
            <div className="icon-container">
              <img className="inner-icon" src={icon_3} />
            </div>
            <div className="content-container">
              <div className="title">Create/Update Products</div>
              <div className="description">Duration: 7m 35s</div>
              <div className="description">9/11/2024, 7:00:00 PM</div>
            </div>
          </div>
          <div className="right-container">
            <div className="status">Processing</div>
          </div>
        </div> */}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0rem",
          height: "8.75rem",
          width: "unset",
          justifyContent: "start",
          alignItems: "stretch",
        }}
      >
        {/* <div className="child-f outer-container">
          <div className="button-group">
            <div className="button button-first">
              <div className="text">Back</div>
            </div>
            <div className="button button-last">
              <div className="text">Next</div>
            </div>
          </div>
        </div> */}
        {/* <div className="child-g outer-container">
          <div className="button button-all-tasks">
            <div className="task-icon-container">
              <img className="task-icon" src={icon_4}></img>
            </div>
            <div className="button-text">All Tasks</div>
            <div className="task-icon-container">
              <img className="task-icon" src={icon_5}></img>
            </div>
          </div>
          <div className="button button-failed">
            <div className="task-icon-container">
              <img className="task-icon" src={icon_6}></img>
            </div>
            <div className="button-text">Failed</div>
            <div className="task-icon-container">
              <img className="task-icon" src={icon_5}></img>
            </div>
          </div>
          <div className="button button-in-progress">
            <div className="task-icon-container">
              <img className="task-icon" src={icon_7}></img>
            </div>
            <div className="button-text">In Progress</div>
            <div className="task-icon-container">
              <img className="task-icon" src={icon_5}></img>
            </div>
          </div>
        </div> */}
        <div className="empty-column"></div>
      </div>
    </div>
  );
}
