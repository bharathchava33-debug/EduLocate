
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const API = "http://127.0.0.1:8000/api";

const DEFAULT_CENTER = [17.385, 78.4867];

// IMPORTANT: Use JavaScript built-in Map
const addressCache = new globalThis.Map();

// Change map position
function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);

  return null;
}

// Convert address into map coordinates
async function getAddressCoordinates(address) {
  if (!address || !address.trim()) {
    return null;
  }

  const cleanAddress = address.trim();

  if (addressCache.has(cleanAddress)) {
    return addressCache.get(cleanAddress);
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(cleanAddress)}` +
      `&format=jsonv2&limit=1&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        `Address lookup failed: ${response.status}`
      );
    }

    const results = await response.json();

    if (!results.length) {
      addressCache.set(cleanAddress, null);
      return null;
    }

    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      addressCache.set(cleanAddress, null);
      return null;
    }

    const coordinates = [lat, lng];

    addressCache.set(cleanAddress, coordinates);

    return coordinates;

  } catch (error) {
    console.error("Address lookup error:", error);
    return null;
  }
}

function Map() {
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [geocodedInstitutions, setGeocodedInstitutions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedInstitution, setSelectedInstitution] =
    useState(null);

  const [center, setCenter] = useState(DEFAULT_CENTER);

  // Fetch institutions
  useEffect(() => {
    let active = true;

    const fetchInstitutions = async () => {
      try {
        const response = await axios.get(
          `${API}/institutions/`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        if (!active) return;

        setInstitutions(data);
        setLoading(false);
        setGeocoding(true);

        const resolved = [];

        // Resolve addresses one by one
        for (let i = 0; i < data.length; i++) {
          if (!active) return;

          const institution = data[i];

          // Address only: do not use stored latitude/longitude
          const coordinates = await getAddressCoordinates(
            institution.location
          );

          if (!active) return;

          if (coordinates) {
            resolved.push({
              ...institution,
              mapCoordinates: coordinates
            });
          }

          setGeocodedInstitutions([...resolved]);

          // Avoid sending requests too quickly
          if (i < data.length - 1) {
            await new Promise(resolve =>
              setTimeout(resolve, 1100)
            );
          }
        }

      } catch (err) {
        console.error(
          "Institution loading error:",
          err
        );

        if (active) {
          setError(
            "Unable to load institutions. Please check your backend."
          );
        }

      } finally {
        if (active) {
          setLoading(false);
          setGeocoding(false);
        }
      }
    };

    fetchInstitutions();

    return () => {
      active = false;
    };
  }, []);

  // Filter institutions
  const filteredInstitutions = institutions.filter(
    institution => {
      const name = (
        institution.name || ""
      ).toLowerCase();

      const location = (
        institution.location || ""
      ).toLowerCase();

      const query = search.toLowerCase();

      return (
        name.includes(query) ||
        location.includes(query)
      );
    }
  );

  // Institutions with successfully located addresses
  const mapInstitutions = geocodedInstitutions.filter(
    mapped =>
      filteredInstitutions.some(
        item => item.id === mapped.id
      )
  );

  // Institutions without resolved addresses
  const unresolvedInstitutions = filteredInstitutions.filter(
    institution =>
      !mapInstitutions.some(
        mapped => mapped.id === institution.id
      )
  );

  // Current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Your browser does not support location access."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setSelectedInstitution(null);

        setCenter([
          position.coords.latitude,
          position.coords.longitude
        ]);
      },
      () => {
        alert(
          "Unable to get your location. Please allow location access."
        );
      }
    );
  };

  // Select institution
  const handleSelectInstitution = institution => {
    const selected = geocodedInstitutions.find(
      item => item.id === institution.id
    );

    if (!selected) {
      alert(
        "This institution's address could not be located. Please verify the complete address."
      );
      return;
    }

    setSelectedInstitution(institution);
    setCenter(selected.mapCoordinates);
  };

  // Logout
  const handleLogout = () => {
    [
      "username",
      "email",
      "name",
      "role",
      "user_role",
      "access_token",
      "refresh_token",
      "access",
      "refresh",
      "edulocate_logged_in"
    ].forEach(key => localStorage.removeItem(key));

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex flex-wrap justify-between items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold text-blue-700">
            EduLocate
          </h1>

          <p className="text-sm text-gray-500">
            Explore institutions near you
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/search")}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Back to Search
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="p-5">

        {/* Search and current location */}
        <div className="bg-white rounded-xl shadow p-4 mb-5 flex flex-wrap gap-3 justify-between">

          <input
            type="text"
            placeholder="Search institution or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-3 flex-1 min-w-48 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleCurrentLocation}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            📍 My Current Location
          </button>

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Total Institutions
            </p>

            <h2 className="text-2xl font-bold text-blue-700">
              {filteredInstitutions.length}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Institutions on Map
            </p>

            <h2 className="text-2xl font-bold text-green-600">
              {mapInstitutions.length}
            </h2>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">
              Address Not Located
            </p>

            <h2 className="text-2xl font-bold text-orange-500">
              {unresolvedInstitutions.length}
            </h2>
          </div>

        </div>

        {/* Loading status */}
        {geocoding && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-5">
            Finding institution locations using addresses.
            Please wait...
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Institution list */}
          <div className="bg-white rounded-xl shadow p-4 lg:col-span-1">

            <h2 className="font-bold text-lg mb-3">
              Institutions
            </h2>

            {loading ? (
              <p className="text-gray-500">
                Loading institutions...
              </p>
            ) : error ? (
              <p className="text-red-500">
                {error}
              </p>
            ) : filteredInstitutions.length === 0 ? (
              <p className="text-gray-500">
                No institutions found.
              </p>
            ) : (

              <div className="space-y-3 max-h-[500px] overflow-y-auto">

                {filteredInstitutions.map(institution => {

                  const isLocated = mapInstitutions.some(
                    item => item.id === institution.id
                  );

                  return (
                    <button
                      key={institution.id}
                      onClick={() =>
                        handleSelectInstitution(institution)
                      }
                      className={`w-full text-left border rounded-lg p-3 hover:bg-blue-50 transition ${
                        selectedInstitution?.id === institution.id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                    >

                      <h3 className="font-semibold text-gray-800">
                        {institution.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {institution.location ||
                          "Address unavailable"}
                      </p>

                      <p className="text-sm text-yellow-600 mt-1">
                        ⭐ {institution.rating || "Not rated"}
                      </p>

                      <p className="text-xs mt-2">
                        {isLocated ? (
                          <span className="text-green-600">
                            ✓ Address located
                          </span>
                        ) : (
                          <span className="text-orange-600">
                            Address not located
                          </span>
                        )}
                      </p>

                    </button>
                  );
                })}

              </div>
            )}

          </div>

          {/* Interactive map */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow overflow-hidden">

            <div className="p-4">
              <h2 className="font-bold text-lg">
                Institution Locations
              </h2>

              <p className="text-sm text-gray-500">
                Map markers are based on institution addresses.
              </p>
            </div>

            <div className="h-[550px] w-full">

              <MapContainer
                center={center}
                zoom={7}
                scrollWheelZoom={true}
                style={{
                  height: "100%",
                  width: "100%"
                }}
              >

                <ChangeMapView center={center} />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapInstitutions.map(institution => (

                  <Marker
                    key={institution.id}
                    position={institution.mapCoordinates}
                  >

                    <Popup>

                      <div className="min-w-40">

                        <h3 className="font-bold text-blue-700">
                          {institution.name}
                        </h3>

                        <p className="text-sm">
                          {institution.location}
                        </p>

                        <p className="text-sm">
                          ⭐ {institution.rating || "Not rated"}
                        </p>

                        <p className="text-sm">
                          {institution.education_level}
                        </p>

                      </div>

                    </Popup>

                  </Marker>

                ))}

              </MapContainer>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Map;
