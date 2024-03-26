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
import distance from "@turf/distance";
import { set } from "ol/transform";

const CurrentPositionBtn = () => {
  const { map } = useContext(MapContext);
  const vlRef = useRef();

  const [pervPosition, setPervPosition] = useState();

  const [currentPosition, setCurrentPosition] = useState();
  const [newPosition, setNewPosition] = useState();
  const [accuracy, setAccuracy] = useState();

  useEffect(() => {
    if (currentPosition) setPoint();
  }, [currentPosition]);
  useEffect(() => {
    if (newPosition) {
      if (pervPosition) {
        const interval = setInterval(() => {
          const longitudeDiff = newPosition[0] - pervPosition[0];
          const latitudeDiff = newPosition[1] - pervPosition[1];
          if (newPosition[0] > currentPosition[0]) {
            setCurrentPosition([
              pervPosition[0] + longitudeDiff / 100,
              pervPosition[1] + latitudeDiff / 100,
            ]);
          }
          if (newPosition[0] == currentPosition[0]) clearInterval(interval);
        }, 10);
      } else {
        setCurrentPosition(newPosition);
      }
      setPervPosition(newPosition);
    }
  }, [newPosition]);

  useEffect(() => {
    if (map) {
      const iconFeature = new Feature(new Point([30, 30]));
      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "map-marker-icon.png",
          scale: 0.2,
        }),
      });

      iconFeature.setStyle(iconStyle);

      const vectorSource = new VectorSource({
        features: [iconFeature],
      });

      map.removeLayer(vlRef.current);
      const vl = new VectorLayer({
        source: vectorSource,
      });
      vlRef.current = vl;
      // console.log(vl.getSource().getFeatures()[0].getGeometry().getCoordinates());
      map.addLayer(vlRef.current);
    }
  }, [map]);
  const point = (lon, lat) => {
    return {
      type: "Feature",
      geometry: {
        coordinates: [lon, lat],
        type: "Point",
      },
    };
  };
  function getLocation() {
    const accuracyThreshold = 100;
    const multiplier = 2;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { accuracy, longitude, latitude, heading } = position.coords;
          if (accuracy <= accuracyThreshold) {
            if (
              pervPosition &&
              distance(
                point(pervPosition[0], pervPosition[1]),
                point(longitude, latitude),
                { units: "meters" }
              ) >
                accuracy * multiplier
            ) {
              console.log(
                "Discarding outlier location data:",
                latitude,
                longitude
              );
              return;
            }
            setNewPosition([longitude, latitude]);
            setAccuracy(accuracy);

            console.log("Valid location data:", latitude, longitude);
          } else {
            console.log("Location accuracy exceeds threshold:", accuracy);

            setNewPosition([longitude, latitude]);
            setAccuracy(accuracy);
          }
        },
        undefined,
        {
          timeout: 1000,
          maximumAge: 1000,
          // enableHighAccuracy: true
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  const setPoint = () => {
    vlRef.current
      .getSource()
      .getFeatures()[0]
      .getGeometry()
      .setCoordinates(currentPosition);
    map.getView().fit(vlRef.current.getSource().getExtent(), { maxZoom: 20 });
  };

  return (
    <>
      <Button
        icon="pi pi-map-marker"
        onClick={() => setInterval(getLocation, 1000)}
      />
      <div style={{ backgroundColor: "white", padding: 5 }}>
        <div>position : {newPosition?.join(" , ")}</div>
        <div>accuracy : {accuracy && accuracy / 2}</div>
        {/* <div>heading : {pervHeading && pervHeading.toFixed(2)}</div> */}
      </div>
    </>
  );
};

export default CurrentPositionBtn;
