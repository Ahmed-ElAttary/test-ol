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
  const beamRef = useRef();
  const [pervPosition, setPervPosition] = useState([]);
  const [pervAccuracy, setPervAccuracy] = useState();
  const [pervHeading, setPervHeading] = useState();

  if (typeof window !== "undefined") {
    window.addEventListener("deviceorientation", (e) => {
  
      setBeam(e.alpha);
      setPervHeading(e.alpha);
    });
  }
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
    const accuracyThreshold = 20;
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

            setPoint([longitude, latitude]);
            // Process valid location data
            console.log("Valid location data:", latitude, longitude);
            // Add code here to update map display or perform other actions
          } else {
            console.log("Location accuracy exceeds threshold:", accuracy);

            // Add code here to handle inaccurate location data (e.g., notify user)
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
      var triangle = new Feature({
        geometry: new Polygon([
          [
            fromLonLat(pervPosition),
            fromLonLat([pervPosition[0] + 0.0005, pervPosition[1] + 0.001]), // Adjust the points to form the triangle
            fromLonLat([pervPosition[0] - 0.0005, pervPosition[1] + 0.001]),
            fromLonLat(pervPosition),
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

      // Rotate the triangle according to device orientation
      triangle.getGeometry().rotate(alpha, fromLonLat(pervPosition));
      const vectorSource = new VectorSource({
        features: [triangle],
      });
      map.removeLayer(beamRef.current);
      beamRef.current = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(beamRef.current);
    }
  };
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
    };
 
  return (
    <>
      <Button icon="pi pi-map-marker" onClick={getLocation} />
      <div style={{ backgroundColor: "white", padding: 5 }}>
        <div>position : {pervPosition.join(" , ")}</div>
        <div>accuracy : {pervAccuracy}</div>
        <div>heading : {pervHeading}</div>
      </div>
    </>
  );
};

export default CurrentPositionBtn;
