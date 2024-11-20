import { FunctionComponent, useEffect, useRef, useState } from "react";
import icon_14 from "../../assets/icon_14.svg";
import "./ios_check_input.css";
import gsap from "gsap";
type IosCheckInputProps = {
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  computedValue?: boolean;
};

const IosCheckInput: FunctionComponent<IosCheckInputProps> = ({
  title = "ERP ID",
  placeholder = "Placeholder",
  disabled = false,
  computedValue = null,
}) => {
  const id = title + "-container";
  const breft = useRef();
  const [check, checkSetter] = useState(computedValue || false);

  const handleEffect = (ev: any) => {
    ev.target.classList.toggle("active");

    if (ev.target.classList.contains("active")) {
      checkSetter(true);
      gsap.killTweensOf(ev.target);
      gsap.killTweensOf(ev.target.childNodes[0]);
      gsap.to(ev.target, {
        duration: 0.4,
        background: "rgb(0, 153, 99.45)",
        ease: "power1.out",
      }),
        gsap.to(ev.target.childNodes[0], {
          duration: 0.2,
          x: "1.225rem",
          ease: "power1.out", // Natural easing function
        });
    } else {
      checkSetter(false);
      gsap.killTweensOf(ev.target);
      gsap.killTweensOf(ev.target.childNodes[0]);
      gsap.to(ev.target, {
        duration: 0.4,
        background: "rgb(244.8, 239.7, 229.5)",
        ease: "power1.out",
      }),
        gsap.to(ev.target.childNodes[0], {
          duration: 0.2,
          x: "0%",
          ease: "power1.out", // Natural easing function
        });
    }
  };

  useEffect(() => {
    if (check) {
      // Programmatically trigger the 'mouseup' event
      const event = new MouseEvent("mouseup", {
        bubbles: true, // Whether the event bubbles up through the DOM
        cancelable: true, // Whether the event can be canceled
        view: window, // Specifies the view in which the event is taking place
      });

      // Trigger the event on the button
      if (breft.current) {
        (breft.current as any).dispatchEvent(event);
      }
    }
  }, []);

  return (
    <>
      <div id={id} className="ios_check_input child-i web-item-row">
        <input
          type="checkbox"
          name={title}
          checked={check}
          style={{ display: "none" }}
        />
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
            <div className="web-item-text">{placeholder}</div>
          </div>
        </div>
        <div className="web-item-switch-container">
          <div
            ref={breft}
            className="web-item-switch-outer"
            onMouseUp={(ev) => handleEffect(ev)}
          >
            <div
              className="web-item-switch-inner"
              style={{ pointerEvents: "none" }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IosCheckInput;
