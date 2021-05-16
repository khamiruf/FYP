import * as turf from "@turf/turf";

// set time_min for new req to appear
// var time_min = matchesArr[0].data.req_appear_time < matchesArr[0].data.worker_appear_time ? matchesArr[0].data.req_appear_time : matchesArr[0].data.worker_appear_time;
// var time_max = matchesArr[matchesArr.length - 2].data.req_appear_time > matchesArr[matchesArr.length - 2].data.worker_appear_time ? matchesArr[matchesArr.length - 2].data.req_appear_time : matchesArr[matchesArr.length - 2].data.worker_appear_time;

// matchesArr.forEach((match) => {
//   if (match.data.req_appear_time < (time_max- 100)) {
//     document.getElementsByClassName("request").style.display="none";
//   }
//   else if (match.data.worker_appear_time < (time_max- 100)) {
//     document.getElementsByClassName("worker").style.display="none";
//   }

// })

// set animation
matchesArr.forEach((match) => {
  var origin = [match.data.worker_lng, match.data.worker_lat]; // lng lat of worker
  var destination = [match.data.req_lng, match.data.req_lat]; // lng lat of req

  // A simple line from origin to destination.
  var route = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [origin, destination],
        },
      },
    ],
  };

  var point = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: origin,
        },
      },
    ],
  };

  // Calculate the distance in kilometers between route start/end point.
  var lineDistance = turf.length(route.features[0]);

  var arc = [];

  // Number of steps to use in the arc and animation, more steps means
  // a smoother arc and animation, but too many steps will result in a
  // low frame rate
  var steps = 500;

  // Draw an arc between the `origin` & `destination` of the two points
  for (var i = 0; i < lineDistance; i += lineDistance / steps) {
    var segment = turf.along(route.features[0], i);
    arc.push(segment.geometry.coordinates);
  }

  // Update the route with calculated arc coordinates
  route.features[0].geometry.coordinates = arc;

  // Used to increment the value of the point measurement against the route.
  var counter = 0;

  map.on("load", function () {
    // Add a source and layer displaying a point which will be animated in a circle.
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
        "line-width": 1,
        "line-color": "#007cbf",
      },
    });

    map.addLayer({
      id: "point",
      source: "point",
      type: "symbol",
      layout: {
        "icon-image": "airport-15",
        "icon-rotate": ["get", "bearing"],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    });

    function animate(route, counter, steps, point) {
      var start =
        route.features[0].geometry.coordinates[
          counter >= steps ? counter - 1 : counter
        ];
      var end =
        route.features[0].geometry.coordinates[
          counter >= steps ? counter : counter + 1
        ];
      if (!start || !end) return;

      // Update point geometry to a new position based on counter denoting
      // the index to access the arc
      point.features[0].geometry.coordinates =
        route.features[0].geometry.coordinates[counter];

      // Calculate the bearing to ensure the icon is rotated to match the route arc
      // The bearing is calculated between the current point and the next point, except
      // at the end of the arc, which uses the previous point and the current point
      point.features[0].properties.bearing = turf.bearing(
        turf.point(start),
        turf.point(end)
      );

      // Update the source with this new data
      map.getSource("point").setData(point);

      // Request the next frame of animation as long as the end has not been reached
      if (counter < steps) {
        requestAnimationFrame(animate);
      }

      counter = counter + 1;
    }

    document.getElementById("replay").addEventListener("click", function () {
      // Set the coordinates of the original point back to origin
      point.features[0].geometry.coordinates = origin;

      // Update the source layer
      map.getSource("point").setData(point);

      // Reset the counter
      counter = 0;

      // Restart the animation
      animate(counter);
    });

    // Start the animation
    animate(counter);
  });
});
