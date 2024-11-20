// import { useFetcher } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect } from "react";
// import { action } from "~/routes/app._index";
import "./pages_navigation.css";
import icon_left from "../../assets/chevron_left.svg"
import icon_right from "../../assets/chevron_right.svg"

export default function PageNavigation() {
  return (
    <div className="pages-navigation container">
      <div className="column">
        <div className="icon-container">
          <img className="icon-top" src={icon_left} />
        </div>
      </div>
      <div className="number-box active">
        <div className="number-text-bold">1</div>
      </div>
      <div className="number-box">
        <div className="number-text">2</div>
      </div>
      <div className="number-box">
        <div className="number-text">3</div>
      </div>
      <div className="number-box">
        <div className="number-text">4</div>
      </div>
      <div className="column">
        <div className="icon-container">
        <img className="icon-top" src={icon_right} />
        </div>
      </div>
    </div>
  );
}
