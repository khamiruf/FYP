import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp";
// eslint-disable-next-line import/no-webpack-loader-syntax
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
import opt from "./data/algo_parsed_0.json";
import q_learn from "./data/algo_parsed_1.json";
import rql from "./data/algo_parsed_2.json";
import fixed_h from "./data/algo_parsed_3.json";
import var_h from "./data/algo_parsed_variable_h.json";
import * as turf from "@turf/turf";

// build the data array
var opt_matches = [];
var opt_result = [];
var q_learn_matches = [];
var q_learn_result = [];
var rql_matches = [];
var rql_result = [];
var fixed_h_matches = [];
var fixed_h_result = [];
var var_h_matches = [];
var var_h_result = [];

// opt algo
for (var k in opt) {
  if (opt.hasOwnProperty(k)) {
    if (k.startsWith("result")) {
      opt_result.push({
        key: k,
        data: opt[k],
      });
    } else {
      opt_matches.push({
        key: k,
        data: opt[k],
      });
    }
  }
}

// q_learn algo
for (var j in q_learn) {
  if (q_learn.hasOwnProperty(j)) {
    if (j.startsWith("result")) {
      q_learn_result.push({
        key: j,
        data: q_learn[j],
      });
    } else {
      q_learn_matches.push({
        key: j,
        data: q_learn[j],
      });
    }
  }
}

// rql algo
for (var i in rql) {
  if (rql.hasOwnProperty(i)) {
    if (i.startsWith("result")) {
      rql_result.push({
        key: i,
        data: rql[i],
      });
    } else {
      rql_matches.push({
        key: i,
        data: rql[i],
      });
    }
  }
}

// fixed_h algo
for (var h in fixed_h) {
  if (fixed_h.hasOwnProperty(h)) {
    if (h.startsWith("result")) {
      fixed_h_result.push({
        key: h,
        data: fixed_h[h],
      });
    } else {
      fixed_h_matches.push({
        key: h,
        data: fixed_h[h],
      });
    }
  }
}

// var_h algo
for (var key in var_h) {
  if (var_h.hasOwnProperty(key)) {
    if (key.startsWith("result")) {
      var_h_result.push({
        key: key,
        data: var_h[key],
      });
    } else {
      var_h_matches.push({
        key: key,
        data: var_h[key],
      });
    }
  }
}

const options = [
  {
    value: "qlearn_dd",
    label: "Adaptive-H",
    matches: q_learn_matches,
    result: q_learn_result,
  },
  {
    value: "rql_dd",
    label: "Restricted Q-learning",
    matches: rql_matches,
    result: rql_result,
  },
  {
    value: "fixed_h",
    label: "Fixed-H",
    matches: fixed_h_matches,
    result: fixed_h_result,
  },
  {
    value: "var_h_dd",
    label: "Variable-H",
    matches: var_h_matches,
    result: var_h_result,
  },
  {
    value: "optimal_dd",
    label: "Optimal Matching (Offline)",
    matches: opt_matches,
    result: opt_result,
  },
];

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken =
  "pk.eyJ1Ijoia2hhbWlydWYiLCJhIjoiY2tsdGM2M253MjR4cDJxcG1pM2lyN2k4MyJ9.ls1Nwwu_2a3rApXlb_RkRg";

const Map = () => {
  // dropdown menu - select matches and result array
  const [selectedOption, setSelectedOption] = useState(options[0].value);
  const [resultArr, setResultArr] = useState(q_learn_result);
  const [matchesArr, setMatchesArr] = useState(q_learn_matches);

  const mapContainer = useRef();
  const [lng, setLng] = useState(110.281);
  const [lat, setLat] = useState(20.0006);
  const [zoom, setZoom] = useState(11.5);

  useEffect(() => {
    var map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.on("move", () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    // select which algo to demo
    // set the result and matches arrays
    options.forEach((option) => {
      if (option.value === selectedOption) {
        setMatchesArr(option.matches);
        setResultArr(option.result);
      }
    });

    // init the markers -- workers and req
    matchesArr.forEach((match) => {
      // create HTML element for each feature
      var el = document.createElement("div");
      el.className = "worker";

      var r = document.createElement("div");
      r.className = "request";

      // make a marker for each feature
      // new mapboxgl.Marker(el)
      //   .setLngLat([match.data.worker_lng, match.data.worker_lat])
      //   .addTo(map);
      new mapboxgl.Marker(r)
        .setLngLat([match.data.req_lng, match.data.req_lat])
        .addTo(map);
    });

    //animation

    // var origin = [matchesArr[0].data.worker_lng, matchesArr[0].data.worker_lat];
    // var destination = [matchesArr[0].data.req_lng, matchesArr[0].data.req_lat];
    var route_features = [];
    var point_features = [];

    matchesArr.forEach((match) => {
      route_features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [match.data.worker_lng, match.data.worker_lat],
            [match.data.req_lng, match.data.req_lat],
          ],
        },
      });

      point_features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [match.data.worker_lng, match.data.worker_lat],
        },
      });
    });
    // A simple line from origin to destination.
    var route = {
      type: "FeatureCollection",
      features: route_features,
    };
    var point = {
      type: "FeatureCollection",
      features: point_features,
    };

    // console.log(point);

    // Calculate the distance in kilometers between route start/end point.
    // Number of steps to use in the arc and animation, more steps means
    // a smoother arc and animation, but too many steps will result in a
    // low frame rate
    var steps = 300;
    for (var i = 0; i < route.features.length; i++) {
      var lineDistance = turf.lineDistance(route.features[i], "kilometers");
      var arc = [];
      for (var j = 0; j < lineDistance; j += lineDistance / steps) {
        var segment = turf.along(route.features[i], j, "kilometers");
        arc.push(segment.geometry.coordinates);
      }
      route.features[i].geometry.coordinates = arc;
    }

    // // Update the route with calculated arc coordinates
    // route.features[0].geometry.coordinates = arc;
    // Used to increment the value of the point measurement against the route.
    var counter = 0;

    var promise = new Promise((resolve, reject) => {
      map.on("load", function () {
        map.addSource("route", {
          type: "geojson",
          data: route,
        });

        map.addSource("point", {
          type: "geojson",
          data: point,
        });

        map.addLayer({
          id: "route",
          source: "route",
          type: "line",
          paint: {
            "line-width": 2,
            "line-color": "#007cbf",
          },
        });

        map.addLayer({
          id: "point",
          source: "point",
          type: "symbol",
          layout: {
            "icon-image": "car-15",
            "icon-size": 1.5,
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });

        // console.log("@@@@@@@@@ from 300: ", map);

        // function animate(featureIdx, cntr) {
        //   // Update point geometry to a new position based on counter denoting
        //   // the index to access the arc.
        //   // console.log("############### from WITHIN THE FUNCTION: ", map);
        //   if (
        //     cntr >= route.features[featureIdx].geometry.coordinates.length - 1
        //   ) {
        //     return;
        //   }
        //   point.features[featureIdx].geometry.coordinates = route.features[featureIdx].geometry.coordinates[cntr];

        //   point.features[featureIdx].properties.bearing = turf.bearing(
        //     turf.point(route.features[featureIdx].geometry.coordinates[cntr >= steps ? cntr - 1 : cntr]),
        //     turf.point(route.features[featureIdx].geometry.coordinates[cntr >= steps ? cntr : cntr + 1])
        //   );
        //   // Update the source with this new data
        //   map.getSource("point").setData(point);

        //   // Request the next frame of animation as long as the end has not been reached
        //   if (cntr < steps) {requestAnimationFrame(function () {animate(featureIdx, cntr + 1);});
        //   }
        // }

        // console.log(route.features.length);
        // console.log(matchesArr.length);

        // document.getElementById("play").addEventListener("click", function () {
        //   // Start the animation
        //   for (var i =0; i< route.features.length; i++){
        //     animate(i, counter);
        //   }
        // });
        // for (var i =0; i< route.features.length; i++){
        //   animate(i, counter);
        // }
        // var lower_match_time = matchesArr[0].data.match_time;

        // var time_step = lower_match_time - 10000;
        // var i = 0;
        // // console.log(lower_match_time);
        // // console.log(time_step);
        // while (i < (matchesArr.length )) {
        //   var match_time = matchesArr[i].data.match_time;
        //   while (time_step < match_time){
        //     time_step++;
        //   }
        //   animate(i, counter);
        //   i++;
        // }
        // resolve("Promise resolved successfully");
        resolve(map);
      }); // map.onload
    }); // promise

    promise.then(function (result) {
      function animate(featureIdx, cntr) {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.
        // console.log("############### from WITHIN THE FUNCTION: ", map);
        if (
          cntr >=
          route.features[featureIdx].geometry.coordinates.length - 1
        ) {
          return;
        }
        point.features[featureIdx].geometry.coordinates =
          route.features[featureIdx].geometry.coordinates[cntr];

        point.features[featureIdx].properties.bearing = turf.bearing(
          turf.point(
            route.features[featureIdx].geometry.coordinates[
              cntr >= steps ? cntr - 1 : cntr
            ]
          ),
          turf.point(
            route.features[featureIdx].geometry.coordinates[
              cntr >= steps ? cntr : cntr + 1
            ]
          )
        );
        // Update the source with this new data
        // map.getSource("point").setData(point);
        result.getSource("point").setData(point);
        // Request the next frame of animation as long as the end has not been reached
        if (cntr < steps) {
          requestAnimationFrame(function () {
            animate(featureIdx, cntr + 1);
          });
        }
      }
      document.getElementById("play").addEventListener("click", function () {
        // Start the animation
        for (var i = 0; i < route.features.length; i++) {
          animate(i, counter);
        }
      });
    });
    return () => map.remove();
  }, [selectedOption]);

  return (
    <div>
      f
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className="resultBar">{resultArr[0].data}</div>
      <div className="map-container" ref={mapContainer} />
      <div className="overlay">
        <button id="play">Play</button>
      </div>
      <select
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Map;
