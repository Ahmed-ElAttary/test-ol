"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import MapContext from "@components/MapComponent/MapContext";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

const CurrentPositionBtn = () => {
  const { map } = useContext(MapContext);
  const vlRef = useRef();
  const [position, setPosition] = useState([]);
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          console.log(position);
          setPoint([
            position.coords.longitude,
            position.coords.latitude,
            position.coords.heading,
            position.coords.accuracy,
          ]);
        },
        undefined,
        { enableHighAccuracy: true }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  const setPoint = (position) => {
    const iconFeature1 = new Feature(new Point(position));
    const iconFeature = new Feature(new Point(position));
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "map-marker-icon.png",
        scale: 0.2,
      }),
    });

    iconFeature.setStyle(iconStyle);

    const vectorSource = new VectorSource({
      features: [iconFeature, iconFeature1],
    });

    map.getView().fit(vectorSource.getExtent(), { maxZoom: 20 });
    map.removeLayer(vlRef.current);
    vlRef.current = new VectorLayer({
      source: vectorSource,
    });
    map.addLayer(vlRef.current);
    setPosition(position);
  };

  return (
    <>
      <Button icon="pi pi-map-marker" onClick={getLocation} />
      <div style={{ backgroundColor: "white", padding: 5 }}>
        {position.join(" , ")}
      </div>
    </>
  );
};

export default CurrentPositionBtn;
