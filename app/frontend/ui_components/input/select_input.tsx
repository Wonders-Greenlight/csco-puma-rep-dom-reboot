import { FunctionComponent } from "react";
import icon_10 from "../../assets/icon_10.svg";
import "./select_input.css";

type SelectInputProps = {
  title?: string;
  name?: string;
  options?: {
    value: string | any;
    title: string;
  }[];
  listener?: Function;
  // paragraph: string
};

const SelectInput: FunctionComponent<SelectInputProps> = ({
  title = "Task",
  options = [],
  name,
  listener = () => {},
}) => {
  return (
    <div className="tasks-stage child-e row-container">
      <div className="column-container">
        <div className="title-container">
          <div className="title-text">{title}</div>
        </div>
        {/* <div className="select-box">
              <div className="option-text">Pick an option</div>
              <img className="color-bar" src={icon_10} />
            </div> */}
        <div className="relative">
          <select
            name={name || title}
            className="select-box option-text"
            onChange={(ev) => listener(ev.target.value)}
          >
            {options.map((e, i) => (
              <option value={e.value} {...(i === 0 && { disabled: true })}>
                {e.title}
              </option>
            ))}
          </select>
          <img
            className="color-bar absolute"
            src={icon_10}
            style={{
              right: "1.4375rem",
              top: "0",
              bottom: "0",
              margin: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default SelectInput;
