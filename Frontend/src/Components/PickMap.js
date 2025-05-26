import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Marker } from "mapbox-gl";
import { SearchBox, useGeocodingCore } from "@mapbox/search-js-react";
import { IoCloseSharp } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";

mapboxgl.accessToken = "pk.eyJ1IjoiY3Jhemljb2RhIiwiYSI6ImNrbmVwYjJ2NzF0amwyb21yZ2VrYWUyamMifQ.fRl4FzY9JsIV21FbdfCHnQ";

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
  const [watchId, setWatchId] = useState(null);

  const geocoding = useGeocodingCore({ accessToken: mapboxgl.accessToken });

  const updateMarkerAndAddress = async (lngLat) => {
    setLat(lngLat.lat);
    setLng(lngLat.lng);
    setCoords([lngLat.lng, lngLat.lat]);
    if (marker.current) marker.current.remove();
    marker.current = new Marker().setLngLat(lngLat).addTo(map.current);
    const addr = await geocoding.reverse(lngLat);
    const feature = addr?.features?.[0];
    const fullAddress = feature?.properties?.full_address || "Unknown location";
    setAddress(fullAddress);
    setLocation(fullAddress);
    setLocationAddr(fullAddress);
  };

  const mapMatchSnap = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/matching/v5/mapbox/driving/${lng},${lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const data = await res.json();
      const snappedCoords = data?.matchings?.[0]?.geometry?.coordinates?.[0];
      return snappedCoords || [lng, lat];
    } catch (err) {
      console.error("Map matching error:", err);
      return [lng, lat];
    }
  };

  const updateUserPositionOnMap = (coords) => {
    if (marker.current) {
      marker.current.setLngLat(coords);
    } else {
      marker.current = new mapboxgl.Marker({ color: "red" }).setLngLat(coords).addTo(map.current);
    }
    map.current?.flyTo({ center: coords, zoom: 16, speed: 0.8, curve: 1.5, essential: true });
  };

  const getRoute = async (start, end) => {
    if (!map.current) return;
  
    // Wait for map to fully load before modifying layers
    if (!map.current.loaded()) {
      map.current.once("load", () => getRoute(start, end));
      return;
    }
  
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
  
    // Add or update route source
    if (map.current.getSource("route")) {
      map.current.getSource("route").setData(routeGeoJSON);
    } else {
      map.current.addSource("route", {
        type: "geojson",
        data: routeGeoJSON,
      });
  
      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
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
  
    new Marker({ color: "red" }).setLngLat(start).addTo(map.current);
    new Marker({ color: "green" }).setLngLat(end).addTo(map.current);
  
    setLng(start[0]);
    setLat(start[1]);
  };
  

  useEffect(() => {
    if (!showMap || map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    map.current.on("idle", () => map.current?.resize());
    if (markedSpot) new Marker().setLngLat([lng, lat]).addTo(map.current);
    map.current.on("click", async (e) => {
      if (route || markedSpot) return;
      await updateMarkerAndAddress(e.lngLat);
    });
    if (route) getRoute(route[0], route[1]);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [showMap]);

  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [lng, lat], zoom });
  }, [lng, lat]);

  useEffect(() => {
    if (!route) return;
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        const snapped = await mapMatchSnap(lng, lat);
        updateUserPositionOnMap(snapped);
        getRoute(snapped, route[1]);
      },
      (err) => console.error("Geo Error", err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    setWatchId(id);
    return () => navigator.geolocation.clearWatch(id);
  }, [route]);

  const goToMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lngLat = { lng: position.coords.longitude, lat: position.coords.latitude };
      map.current?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 14 });
      await updateMarkerAndAddress(lngLat);
    });
  };

  return (
    <div className={`${showMap ? "flex" : "hidden"} justify-center items-center absolute top-0 left-0 bg-[#6b7280aa] w-[100vw] h-[100vh] z-50`}>
      <div className="bg-white w-[90%] md:w-[60%] rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="border-b flex justify-between items-center p-2">
          <div className="flex-1">
            <SearchBox
              accessToken={mapboxgl.accessToken}
              map={map.current}
              mapboxgl={mapboxgl}
              placeholder="Search for address or place"
              value={location}
              onChange={setLocation}
              onRetrieve={(d) => {
                const feature = d?.features?.[0];
                if (!feature) return;
                const fullAddress = feature?.properties?.full_address || "Unknown location";
                const coords = feature?.geometry?.coordinates;
                setLocation(fullAddress);
                setLocationAddr(fullAddress);
                setAddress(fullAddress);
                setCoords(coords);
                setLng(coords[0]);
                setLat(coords[1]);
                setZoom(14);
                if (marker.current) marker.current.remove();
                marker.current = new Marker().setLngLat(coords).addTo(map.current);
                map.current.flyTo({ center: coords, zoom: 14 });
              }}
              options={{ language: "en", types: ["place", "poi", "address"] }}
            />
            <div className="text-sm mt-1">{address}</div>
          </div>
          <IoCloseSharp className="cursor-pointer" size={20} onClick={() => setShowMap(false)} />
        </div>

        <div ref={mapContainer} style={{ height: "400px", width: "100%" }} className="relative"></div>

        {route && (
          <>
            <div className="flex m-2 items-center gap-1">You: <FaLocationDot color="red" size={20} /></div>
            <div className="flex m-2 items-center gap-1">Pick Location: <FaLocationDot color="#5f5" size={20} /></div>
          </>
        )}

        {!route && (
          <div className="mt-5 h-12 pl-5 border-t py-2 mb-2 flex gap-2">
            <button className="border bg-blue-700 text-white px-2 py-1 rounded-md shadow-md hover:shadow-xl" onClick={goToMyLocation}>My Location</button>
            <button className="border bg-green-700 text-white px-2 py-1 rounded-md shadow-md hover:shadow-xl" onClick={() => setShowMap(false)}>Use Location</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickMap;