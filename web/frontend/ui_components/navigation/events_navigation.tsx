import {
  useEffect,
  useState,
  DOMAttributes,
  MouseEventHandler,
  FunctionComponent,
  useRef,
} from "react";
import "./events_navigation.css";
import gsap from "gsap";

type EventNavigationProps = {
  labelsNames: String[];
  callback?: Function;
};

const EventsNavigation: FunctionComponent<EventNavigationProps> = ({
  labelsNames,
  callback = () => {}
}) => {
  const [currentTab, currentTabSetter] = useState(labelsNames[0].toLowerCase());
  const meRef = useRef<HTMLDivElement>();

  function handleClick(event: any) {
    const target = event.target as HTMLDivElement;

    if (target.classList.contains("button")) {
      console.log(target.children[0].children[0].innerHTML);
      callback(target.children[0].children[0].innerHTML)

      const alllabels = meRef.current?.querySelectorAll(
        ".button",
      );

      alllabels?.forEach((e) => {
        e.classList.remove("active");
      });

      target.classList.toggle("active");

      currentTabSetter(target.children[0].children[0].innerHTML);
    }
  }

  useEffect(() => {
    console.log(currentTab);

    const navButtons = meRef.current?.querySelectorAll(
      ".button",
    );

    navButtons?.forEach((button) => {
      gsap.killTweensOf(button);
      if (button.classList.contains("active")) {
        gsap.set(button, {
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        });
        gsap.to(button, {
          duration: 0.1,
          ease: "power2.out", // Natural easing function
          backgroundColor: "rgb(255, 255, 255)",
          color: "rgb(28.05, 22.95, 12.75)",
        });
      } else {
        gsap.to(button, {
          duration: 0.4,
          ease: "power2.out", // Natural easing function
          backgroundColor: "rgba(255, 255, 255, 0)",
          color: "rgb(160.65, 130.05, 73.95)",
        });
      }
    });
  }, [currentTab]);

  return (
    <div ref={meRef} className="summary-stage events-navigation outer-container child-a">
      <div className="inner-container">
        {labelsNames.map((labelName, i) => (
          <EventsNavigationTag
            labelName={labelName}
            handleClick={handleClick}
            active={i == 0}
          />
        ))}
      </div>
    </div>
  );
};

type EventNavigationTagProps = {
  labelName: String;
  handleClick: MouseEventHandler;
  active: boolean;
};

const EventsNavigationTag: FunctionComponent<EventNavigationTagProps> = ({
  labelName,
  handleClick,
  active
}) => {
  return (
    <div
      className={`button button-${labelName.toLowerCase()} ${active ? "active" : ""}`}
      onMouseUp={handleClick}
    >
      <div className="label">
        <div className="label-text label-text-hoy">{labelName}</div>
      </div>
    </div>
  );
};

export default EventsNavigation;
