import React from "react";

import styes from "./Controls.module.css";
import FlyHomeBtn from "./CurrentPositionBtn/CurrentPositionBtn";

const Controls = ({}) => {
  return (
    <div>
      <div className={[styes.control, styes.top, styes.left].join(" ")}></div>

      <div className={[styes.control, styes.top, styes.right].join(" ")}>
        <FlyHomeBtn />
      </div>
      <div
        className={[styes.control, styes.bottom, styes.left].join(" ")}
      ></div>
      <div
        className={[styes.control, styes.bottom, styes.right].join(" ")}
      ></div>
    </div>
  );
};

export default Controls;
