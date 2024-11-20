import { FunctionComponent, useEffect } from "react";
import {
  mouseOutButton,
  mouseOutCard,
  mouseOverButton,
  mouseOverCard,
} from "../../utils/events";
import gsap from "gsap";
import { useLocation, useNavigate, useNavigation } from "react-router";
import { time } from "console";

type DefaultLoaderProps = {
  init?: Function;
};

const DefaultLoader: FunctionComponent<DefaultLoaderProps> = ({
  init = () => {},
}) => {
  // const navigation = useNavigation();
  const navigation1 = useLocation();
  var cleanup: () => void = () => {};
  var timeouts: NodeJS.Timeout[] = [];
  
  
  
  useEffect(() => {

    init();
  }, [navigation1]);

  return <></>;
};
export default DefaultLoader;
