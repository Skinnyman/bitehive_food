import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Marker } from "mapbox-gl";
import { SearchBox, useGeocodingCore } from "@mapbox/search-js-react";
import { IoCloseSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
//import "mapbox-gl/dist/mapbox-gl.css"; // 🔥 Required for map to render

mapboxgl.accessToken =
  "pk.eyJ1IjoiY3Jhemljb2RhIiwiYSI6ImNrbmVwYjJ2NzF0amwyb21yZ2VrYWUyamMifQ.fRl4FzY9JsIV21FbdfCHnQ";

const PickMap = ({
  showMap = false,
  setShowMap = () => {},
  setCoords = () => {},
  setLocationAddr = () => {},
  route = false,
  markedSpot = null,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [lng, setLng] = useState(markedSpot?.lng || -1.6221);
  const [lat, setLat] = useState(markedSpot?.lat || 6.6816);
  const [zoom, setZoom] = useState(14);
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");

  const geocoding = useGeocodingCore({
    accessToken: mapboxgl.accessToken,
  });

  // Initialize map
  useEffect(() => {
    if (!showMap || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("idle", () => {
      map.current?.resize();
    });

    if (markedSpot) {
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current);
    }

    map.current.on("click", async (e) => {
      if (route || markedSpot) return;
      const lngLat = e.lngLat;
      setLat(lngLat.lat);
      setLng(lngLat.lng);
      setCoords([lngLat.lng, lngLat.lat]);

      if (marker.current) marker.current.remove();
      marker.current = new Marker().setLngLat(lngLat).addTo(map.current);

      const addr = await geocoding.reverse(lngLat);
      const fullAddress =
        addr?.features?.[0]?.properties?.full_address || "Unknown location";
      setAddress(fullAddress);
      setLocation(fullAddress);
      setLocationAddr(fullAddress);
    });

    if (route) getRoute(route[0], route[1]);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [showMap, lng, lat, zoom, markedSpot, route]);

  // Resize on open
  useEffect(() => {
    if (map.current && showMap) {
      map.current.resize();
    }
  }, [showMap]);

  // Fly to updated coords
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [lng, lat], zoom });
  }, [lng, lat, zoom]);

  // Route drawing
  const getRoute = async (start, end) => {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const data = await res.json();
    const coords = data.routes[0].geometry.coordinates;

    const routeGeoJSON = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    };

    if (map.current.getSource("route")) {
      map.current.getSource("route").setData(routeGeoJSON);
    } else {
      map.current.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: routeGeoJSON,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }

    new mapboxgl.Marker({ color: "red" }).setLngLat(start).addTo(map.current);
    new mapboxgl.Marker({ color: "green" }).setLngLat(end).addTo(map.current);

    setLng(start[0]);
    setLat(start[1]);
  };

  return (
    <div
      className={`${
        showMap ? "flex" : "hidden"
      } absolute top-0 left-0 z-50 w-screen h-screen bg-gray-500 bg-opacity-70 justify-center items-center`}
    >
      <div
        className="bg-white w-[90%] md:w-[60%] rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b flex justify-between items-center p-2">
          <div className="flex-1">
            <SearchBox
              accessToken={mapboxgl.accessToken}
              map={map.current}
              mapboxgl={mapboxgl}
              placeholder="Search for address"
              value={location}
              onChange={setLocation}
              onRetrieve={(result) => {
                const fullAddress =
                  result.features[0].properties.full_address || "Unknown";
                const coords = result.features[0].geometry.coordinates;

                setLocation(fullAddress);
                setAddress(fullAddress);
                setLocationAddr(fullAddress);
                setCoords(coords);
                setLng(coords[0]);
                setLat(coords[1]);

                if (marker.current) marker.current.remove();
                marker.current = new Marker().setLngLat(coords).addTo(map.current);
              }}
              options={{ language: "en", country: "gh" }}
            />
            <div className="text-sm mt-1">{address}</div>
          </div>
          <IoCloseSharp
            className="cursor-pointer"
            size={20}
            onClick={() => setShowMap(false)}
          />
        </div>

        <div
          ref={mapContainer}
          style={{ height: "400px", width: "100%" }}
          className="relative"
        ></div>

        {route ? (
          <div className="p-3">
            <div className="flex items-center gap-2">
              <span>You:</span> <FaLocationDot color="red" />
            </div>
            <div className="flex items-center gap-2">
              <span>Delivery Location:</span> <FaLocationDot color="green" />
            </div>
          </div>
        ) : (
          <div className="flex justify-between p-3 border-t">
            <button
              className="bg-blue-700 text-white px-3 py-2 rounded shadow hover:shadow-lg"
              onClick={() =>
                navigator.geolocation.getCurrentPosition((pos) => {
                  const coords = [pos.coords.longitude, pos.coords.latitude];
                  setLng(coords[0]);
                  setLat(coords[1]);
                  setZoom(14);
                  if (marker.current) marker.current.remove();
                  marker.current = new Marker().setLngLat(coords).addTo(map.current);
                })
              }
            >
              My Location
            </button>
            <button
              className="bg-green-700 text-white px-3 py-2 rounded shadow hover:shadow-lg"
              onClick={() => setShowMap(false)}
            >
              Use Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickMap;
