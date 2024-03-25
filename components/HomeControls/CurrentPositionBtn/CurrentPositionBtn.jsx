"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import MapContext from "@components/MapComponent/MapContext";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import distance from "@turf/distance";
import { Polygon } from "ol/geom";
import { fromLonLat } from "ol/proj";
import Stroke from "ol/style/Stroke";
const CurrentPositionBtn = () => {
  const { map } = useContext(MapContext);
  const vlRef = useRef();

  const [pervPosition, setPervPosition] = useState([]);
  const [pervAccuracy, setPervAccuracy] = useState();
  const [pervHeading, setPervHeading] = useState(10.5656645564);

  // if (typeof window !== "undefined") {
  //   window.addEventListener("deviceorientation", (e) => {
  //     setPervHeading(e.alpha);
  //     console.log(e.alpha);
  //   });
  // }

  useEffect(() => {
    if (map) setPoint(pervPosition);
  }, [pervPosition]);
  useEffect(() => {
    if (map && pervHeading && pervPosition.length)
      setBeam(pervHeading, pervPosition);
  }, [pervHeading]);
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
      navigator.geolocation.watchPosition(
        (position) => {
          const { accuracy, longitude, latitude, heading } = position.coords;
          if (accuracy <= accuracyThreshold) {
            if (
              pervPosition.length &&
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
              return; // Skip this data point
            }
            setPervPosition([longitude, latitude]);
            setPervAccuracy(accuracy);

            // Process valid location data
            console.log("Valid location data:", latitude, longitude);
            // Add code here to update map display or perform other actions
          } else {
            console.log("Location accuracy exceeds threshold:", accuracy);
            // Add code here to handle inaccurate location data (e.g., notify user)
            setPervPosition([longitude, latitude]);
            setPervAccuracy(accuracy);
          }
        }
        // undefined,
        // { enableHighAccuracy: true }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  const setBeam = (alpha) => {
    // Clear previous orientation vector

    if (alpha !== null && map) {
      console.log(vlRef.current.source);
      vlRef.current
        .getSource()
        .getFeatures()[1]
        .getGeometry()
        .rotate(alpha, pervPosition);
      // .getGeometry().rotate(alpha, fromLonLat([longitude, latitude]));
    }
  };

  const setPoint = (position) => {
    const [longitude, latitude] = position;
    const beam = new Feature({
      geometry: new Polygon([
        [
          [longitude, latitude],
          [longitude + 0.0005, latitude + 0.001],
          [longitude - 0.0005, latitude + 0.001],
          [longitude, latitude],
        ],
      ]),
      style: new Style({
        fill: new Fill({
          color: "blue",
        }),
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
      }),
    });
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
      features: [iconFeature, beam],
    });

    map.getView().fit(vectorSource.getExtent(), { maxZoom: 20 });
    map.removeLayer(vlRef.current);
    const vl = new VectorLayer({
      source: vectorSource,
    });
    vlRef.current = vl;
    // vl.getSource().getFeatures()[1].getGeometry().rotate;
    map.addLayer(vlRef.current);
  };

  return (
    <>
      <Button icon="pi pi-map-marker" onClick={getLocation} />
      <div style={{ backgroundColor: "white", padding: 5 }}>
        <div>position : {pervPosition.join(" , ")}</div>
        <div>accuracy : {pervAccuracy && pervAccuracy / 2}</div>
        <div>heading : {pervHeading.toFixed(2)}</div>
      </div>
    </>
  );
};

export default CurrentPositionBtn;
