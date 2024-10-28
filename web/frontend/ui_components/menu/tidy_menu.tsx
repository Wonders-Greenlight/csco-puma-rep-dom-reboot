// import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
// import { action } from "~/routes/app._index";
import "./tidy_menu.css";
import img_4 from "../../assets/icon_04.svg";
import img_5 from "../../assets/icon_05.svg";
import img_6 from "../../assets/icon_06.svg";
import img_7 from "../../assets/icon_07.svg";

export default function TidyMenu() {
  return (
    <div
      className="tidy-menu flex-column-start"
      style={{ height: "7.9375rem" }}
    >
      <div className="white-bg" style={{ height: "3.1875rem" }}></div>
      <div className="flex-row-start" style={{ height: "3.5rem" }}>
        <div className="button" style={{ width: "8rem" }}>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_4} />
            </div>
          </div>
          <div className="button-text" style={{ width: "3.5rem" }}>
            All Tasks
          </div>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_5} />
            </div>
          </div>
        </div>

        <div className="button" style={{ width: "7.0625rem" }}>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_6} />
            </div>
          </div>
          <div className="button-text" style={{ width: "2.5625rem" }}>
            Failed
          </div>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_5} />
            </div>
          </div>
        </div>

        <div className="button" style={{ width: "9.1875rem" }}>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_7} />
            </div>
          </div>
          <div className="button-text" style={{ width: "4.6875rem" }}>
            In Progress
          </div>
          <div className="icon-wrapper">
            <div className="icon-wrapper">
              <img src={img_5} />
            </div>
          </div>
        </div>
      </div>
      <div className="white-space"></div>
    </div>
  );
}
