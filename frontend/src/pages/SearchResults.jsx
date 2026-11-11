
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";
const SAVED_KEY = "edulocate_saved";
const COMPARE_KEY = "edulocate_compare";
const MAX_COMPARE = 3;

const INSTITUTION_TYPES = [
    { label: "School", value: "school" },
    { label: "Junior College", value: "inter_college" },
    { label: "Diploma College", value: "diploma" },
    { label: "Engineering College", value: "engineering" },
    { label: "Degree College", value: "degree" }
];

// Updated distance options
const DISTANCE_OPTIONS = [
    { label: "Within 5 km", value: "5" },
    { label: "Within 10 km", value: "10" },
    { label: "Within 20 km", value: "20" },
    { label: "Within 30 km", value: "30" },
    { label: "Within 50 km", value: "50" },
    { label: "Any distance", value: "any" }
];

function readStorage(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function SearchResults() {
    const navigate = useNavigate();

    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");

    const [selectedType, setSelectedType] = useState("");

    const [locationQuery, setLocationQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    const [selectedDistance, setSelectedDistance] = useState("");
    const [selectedRating, setSelectedRating] = useState("");
    const [selectedFee, setSelectedFee] = useState("");
    const [sortBy, setSortBy] = useState("Recommended");

    const [savedInstitutions, setSavedInstitutions] = useState(
        () => readStorage(SAVED_KEY)
    );

    const [compareInstitutions, setCompareInstitutions] = useState(
        () => readStorage(COMPARE_KEY)
    );

    const handleLogout = () => {
        [
            "username", "email", "name", "role", "user_role",
            "access_token", "refresh_token", "access", "refresh",
            "edulocate_logged_in"
        ].forEach((key) => localStorage.removeItem(key));

        navigate("/", { replace: true });
    };

    const getInstitutionType = (institution) => {
        const types = {
            school: "School",
            inter_college: "Junior College",
            diploma: "Diploma College",
            engineering: "Engineering College",
            degree: "Degree College"
        };

        return types[institution.education_level] ||
            institution.education_level || "Other";
    };

    const fetchInstitutions = async () => {
        try {
            setLoading(true);
            setApiError("");

            const response = await axios.get(`${API_URL}/institutions/`);

            const data = response.data;
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data.results)
                    ? data.results
                    : [];

            setInstitutions(list);
        } catch (error) {
            console.error(error.response?.data || error.message);

            setApiError(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Unable to load institutions. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstitutions();
    }, []);

    // Location suggestions
    useEffect(() => {
        if (!selectedType || locationQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        if (
            selectedLocation &&
            locationQuery === selectedLocation.address
        ) {
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLocationLoading(true);
                setLocationError("");

                const response = await axios.get(
                    `${API_URL}/institutions/location-suggestions/`,
                    {
                        params: { q: locationQuery.trim() }
                    }
                );

                setSuggestions(response.data.results || []);
            } catch (error) {
                setSuggestions([]);

                setLocationError(
                    error.response?.data?.error ||
                    "Unable to search locations."
                );
            } finally {
                setLocationLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [locationQuery, selectedLocation, selectedType]);

    const findNearbyInstitutions = async (
        latitude,
        longitude,
        label,
        educationLevel = selectedType
    ) => {
        if (!educationLevel) {
            setLocationError("Please select an institution type first.");
            return;
        }

        try {
            setLoading(true);
            setApiError("");
            setLocationError("");

            const response = await axios.get(
                `${API_URL}/institutions/nearby/`,
                {
                    params: {
                        latitude,
                        longitude,
                        education_level: educationLevel
                    }
                }
            );

            const data = response.data;
            const list = Array.isArray(data)
                ? data
                : data.results || [];

            setInstitutions(list);

            setSelectedLocation({
                latitude,
                longitude,
                address: label
            });

            setLocationQuery(label);
            setSuggestions([]);
            setSelectedDistance("");
        } catch (error) {
            console.error(error.response?.data || error.message);

            setLocationError(
                error.response?.data?.error ||
                "Unable to find nearby institutions."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = async (event) => {
        const newType = event.target.value;

        setSelectedType(newType);
        setSuggestions([]);
        setLocationError("");
        setSelectedDistance("");
        setSelectedRating("");
        setSelectedFee("");
        setSortBy("Recommended");

        if (selectedLocation && newType) {
            await findNearbyInstitutions(
                selectedLocation.latitude,
                selectedLocation.longitude,
                selectedLocation.address,
                newType
            );
        } else {
            setSelectedLocation(null);
            setLocationQuery("");
            await fetchInstitutions();
        }
    };

    const useCurrentLocation = () => {
        setLocationError("");

        if (!selectedType) {
            setLocationError(
                "Please select an institution type first."
            );
            return;
        }

        if (!navigator.geolocation) {
            setLocationError(
                "Your browser does not support location services."
            );
            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await findNearbyInstitutions(
                    position.coords.latitude,
                    position.coords.longitude,
                    "My Current Location"
                );

                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);

                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError(
                        "Location permission denied. Please allow location access or search manually."
                    );
                } else if (error.code === error.TIMEOUT) {
                    setLocationError(
                        "Location request timed out. Please try again."
                    );
                } else {
                    setLocationError(
                        "Unable to get your current location."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    };

    const selectLocation = async (location) => {
        if (!selectedType) {
            setLocationError("Please select an institution type first.");
            return;
        }

        await findNearbyInstitutions(
            location.latitude,
            location.longitude,
            location.address || location.name
        );
    };

    const showAllInstitutions = async () => {
        if (!selectedType) {
            setLocationError("Please select an institution type first.");
            return;
        }

        setSelectedLocation(null);
        setLocationQuery("");
        setSuggestions([]);
        setLocationError("");
        setSelectedDistance("");

        await fetchInstitutions();
    };

    const getInstitutionFee = (institution) => {
        const possibleFees = [
            institution.annual_fee,
            institution.fee,
            institution.fees,
            institution.course_fee,
            institution.class_fee,
            institution.courses?.find(
                (course) => course.course_fee !== null &&
                    course.course_fee !== undefined
            )?.course_fee,
            institution.program_branches?.find(
                (branch) => branch.branch_fee !== null &&
                    branch.branch_fee !== undefined
            )?.branch_fee,
            institution.inter_groups?.find(
                (group) => group.group_fee !== null &&
                    group.group_fee !== undefined
            )?.group_fee
        ];

        const fee = possibleFees.find(
            (value) => value !== null &&
                value !== undefined &&
                value !== ""
        );

        if (fee === undefined) return null;

        const parsedFee = Number(fee);
        return Number.isFinite(parsedFee) ? parsedFee : null;
    };

    const toggleSave = (institution) => {
        const exists = savedInstitutions.some(
            (item) => item.id === institution.id
        );

        const updated = exists
            ? savedInstitutions.filter(
                (item) => item.id !== institution.id
            )
            : [...savedInstitutions, institution];

        setSavedInstitutions(updated);
        localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    };

    const toggleCompare = (institution) => {
        const exists = compareInstitutions.some(
            (item) => item.id === institution.id
        );

        let updated;

        if (exists) {
            updated = compareInstitutions.filter(
                (item) => item.id !== institution.id
            );
        } else {
            if (compareInstitutions.length >= MAX_COMPARE) {
                alert("You can compare a maximum of 3 institutions.");
                return;
            }

            updated = [...compareInstitutions, institution];
        }

        setCompareInstitutions(updated);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    };

    const clearFilters = () => {
        setSelectedDistance("");
        setSelectedRating("");
        setSelectedFee("");
        setSortBy("Recommended");
    };

    const filteredInstitutions = useMemo(() => {
        let result = [...institutions];

        if (selectedType) {
            result = result.filter(
                (item) => item.education_level === selectedType
            );
        } else {
            result = [];
        }

        // Distance filter
        if (selectedDistance && selectedDistance !== "any") {
            result = result.filter((item) => {
                const distance = Number(item.distance);

                if (!Number.isFinite(distance)) return false;

                return distance <= Number(selectedDistance);
            });
        }

        // Rating filter
        if (selectedRating) {
            result = result.filter((item) => {
                const rating = Number(item.rating);
                return Number.isFinite(rating) &&
                    rating >= Number(selectedRating);
            });
        }

        // Fee filter
        if (selectedFee && selectedFee !== "any") {
            result = result.filter((item) => {
                const fee = getInstitutionFee(item);

                if (fee === null) return false;
                if (selectedFee === "25000") return fee < 25000;
                if (selectedFee === "50000") return fee >= 25000 && fee <= 50000;
                if (selectedFee === "100000") return fee > 50000 && fee <= 100000;
                if (selectedFee === "200000") return fee > 100000 && fee <= 200000;
                if (selectedFee === "above200000") return fee > 200000;

                return true;
            });
        }

        // Sorting
        if (sortBy === "Nearest") {
            result.sort((a, b) =>
                (Number(a.distance) || Infinity) -
                (Number(b.distance) || Infinity)
            );
        }

        if (sortBy === "Lowest Fee") {
            result.sort((a, b) =>
                (getInstitutionFee(a) ?? Infinity) -
                (getInstitutionFee(b) ?? Infinity)
            );
        }

        if (sortBy === "Highest Rating") {
            result.sort((a, b) =>
                (Number(b.rating) || 0) -
                (Number(a.rating) || 0)
            );
        }

        return result;
    }, [
        institutions,
        selectedType,
        selectedDistance,
        selectedRating,
        selectedFee,
        sortBy
    ]);

    return (
        <div className="min-h-screen bg-slate-50">

            <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
                <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">

                    <div
                        className="flex cursor-pointer items-center gap-3"
                        onClick={() => navigate("/home")}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
                            🎓
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                EduLocate
                            </h1>
                            <p className="text-[11px] text-slate-500">
                                Smart Education Discovery
                            </p>
                        </div>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-1">
                        {[
                            ["Home", "/home"],
                            ["Map", "/map"],
                            ["Compare", "/compare"],
                            ["Cost Calculator", "/cost-calculator"],
                            ["Cutoff Trends", "/cutoff-trends"],
                            ["AI Advisor", "/ai-advisor"],
                            ["Saved", "/saved"]
                        ].map(([label, path]) => (
                            <button
                                key={path}
                                onClick={() => navigate(path)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                                {label}
                                {path === "/compare" && compareInstitutions.length > 0
                                    ? ` (${compareInstitutions.length})`
                                    : ""}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <button onClick={() => navigate("/home")}>Home</button>
                        <span>/</span>
                        <span className="text-slate-700">Search</span>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                        Find the Right Educational Institution
                    </h2>

                    <p className="mt-2 max-w-3xl text-slate-500">
                        Select an institution type and enter a location to
                        find matching institutions.
                    </p>
                </div>

                <section className="relative z-20 mb-7 rounded-2xl border bg-white p-5 shadow-sm">

                    <h3 className="mb-4 text-lg font-bold">
                        Search Institutions
                    </h3>

                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-semibold">
                            Step 1: Select Institution Type *
                        </label>

                        <select
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="w-full rounded-lg border px-4 py-3 md:max-w-xl"
                        >
                            <option value="">-- Select Institution Type --</option>
                            {INSTITUTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Step 2: Enter Location
                        </label>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={locationQuery}
                                    disabled={!selectedType}
                                    onChange={(event) => {
                                        setLocationQuery(event.target.value);
                                        setSelectedLocation(null);
                                    }}
                                    placeholder={
                                        selectedType
                                            ? "Enter city, district or area..."
                                            : "Select institution type first"
                                    }
                                    className="w-full rounded-lg border px-4 py-3 disabled:bg-slate-100"
                                />

                                {locationLoading && (
                                    <span className="absolute right-3 top-3 text-sm text-slate-500">
                                        Searching...
                                    </span>
                                )}

                                {suggestions.length > 0 && selectedType && (
                                    <div className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-lg border bg-white shadow-xl">
                                        {suggestions.map((location) => (
                                            <button
                                                key={location.place_id}
                                                onClick={() => selectLocation(location)}
                                                className="block w-full border-b px-4 py-3 text-left hover:bg-blue-50"
                                            >
                                                <p className="font-semibold">
                                                    {location.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {location.address}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={useCurrentLocation}
                                disabled={!selectedType || locationLoading}
                                className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                📍 Use Current Location
                            </button>

                            <button
                                onClick={showAllInstitutions}
                                disabled={!selectedType || loading}
                                className="rounded-lg border px-5 py-3 font-semibold disabled:opacity-50"
                            >
                                Show All
                            </button>
                        </div>

                        {!selectedType && (
                            <p className="mt-2 text-sm text-amber-700">
                                Select an institution type before searching.
                            </p>
                        )}

                        {locationError && (
                            <p className="mt-3 text-sm text-red-600">
                                {locationError}
                            </p>
                        )}

                        {selectedLocation && (
                            <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                Showing institutions near:{" "}
                                <strong>{selectedLocation.address}</strong>
                            </div>
                        )}

                        {locationQuery.length >= 2 &&
                            selectedType &&
                            !locationLoading &&
                            suggestions.length === 0 &&
                            !selectedLocation &&
                            !locationError && (
                                <p className="mt-2 text-sm text-slate-500">
                                    No location suggestions found.
                                </p>
                            )}
                    </div>
                </section>

                {loading && (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
                        <p className="font-medium text-slate-600">
                            Loading institutions...
                        </p>
                    </div>
                )}

                {!loading && apiError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                        <h3 className="font-bold">Unable to load institutions</h3>
                        <p className="mt-2 text-sm">{apiError}</p>
                        <button
                            onClick={fetchInstitutions}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !apiError && (
                    <>
                        {!selectedType && (
                            <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
                                <div className="mb-4 text-5xl">🎓</div>
                                <h3 className="text-xl font-bold">
                                    Select an Institution Type
                                </h3>
                                <p className="mt-2 text-slate-500">
                                    Choose School, Junior College, Diploma,
                                    Engineering or Degree to start.
                                </p>
                            </div>
                        )}

                        {selectedType && (
                            <div className="flex flex-col gap-6 lg:flex-row">

                                <aside className="w-full shrink-0 lg:w-72">
                                    <div className="rounded-2xl border bg-white p-5 shadow-sm lg:sticky lg:top-24">

                                        <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold">Filters</h3>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Refine your search
                                                </p>
                                            </div>
                                            <button
                                                onClick={clearFilters}
                                                className="text-sm font-semibold text-red-500"
                                            >
                                                Clear All
                                            </button>
                                        </div>

                                        <div className="mb-6 rounded-lg bg-blue-50 p-3">
                                            <p className="text-xs text-blue-600">
                                                Selected Institution Type
                                            </p>
                                            <p className="mt-1 font-bold text-blue-800">
                                                {getInstitutionType({
                                                    education_level: selectedType
                                                })}
                                            </p>
                                        </div>

                                        {/* UPDATED DISTANCE FILTER */}
                                        <FilterGroup title="Distance">
                                            {DISTANCE_OPTIONS.map((option) => (
                                                <FilterButton
                                                    key={option.value}
                                                    label={option.label}
                                                    value={option.value}
                                                    selected={selectedDistance}
                                                    setSelected={setSelectedDistance}
                                                />
                                            ))}

                                            {!selectedLocation && (
                                                <p className="mt-2 text-xs text-amber-700">
                                                    Select a location to use distance filters.
                                                </p>
                                            )}
                                        </FilterGroup>

                                        <FilterGroup title="Customer Rating">
                                            {[
                                                ["★ 4.5 and above", "4.5"],
                                                ["★ 4.0 and above", "4.0"],
                                                ["★ 3.5 and above", "3.5"],
                                                ["★ 3.0 and above", "3.0"]
                                            ].map(([label, value]) => (
                                                <FilterButton
                                                    key={value}
                                                    label={label}
                                                    value={value}
                                                    selected={selectedRating}
                                                    setSelected={setSelectedRating}
                                                />
                                            ))}
                                        </FilterGroup>

                                        <FilterGroup title="Annual Fees">
                                            {[
                                                ["Under ₹25,000", "25000"],
                                                ["₹25,000 – ₹50,000", "50000"],
                                                ["₹50,000 – ₹1,00,000", "100000"],
                                                ["₹1,00,000 – ₹2,00,000", "200000"],
                                                ["Above ₹2,00,000", "above200000"],
                                                ["Any fees", "any"]
                                            ].map(([label, value]) => (
                                                <FilterButton
                                                    key={value}
                                                    label={label}
                                                    value={value}
                                                    selected={selectedFee}
                                                    setSelected={setSelectedFee}
                                                />
                                            ))}
                                        </FilterGroup>
                                    </div>
                                </aside>

                                <section className="min-w-0 flex-1">
                                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                {getInstitutionType({
                                                    education_level: selectedType
                                                })} Institutions
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {filteredInstitutions.length} institutions found
                                            </p>
                                        </div>

                                        <select
                                            value={sortBy}
                                            onChange={(event) => setSortBy(event.target.value)}
                                            className="rounded-lg border bg-white px-4 py-2 text-sm"
                                        >
                                            <option>Recommended</option>
                                            <option>Nearest</option>
                                            <option>Lowest Fee</option>
                                            <option>Highest Rating</option>
                                        </select>
                                    </div>

                                    {filteredInstitutions.length === 0 && (
                                        <div className="rounded-2xl border bg-white p-12 text-center">
                                            <div className="mb-4 text-5xl">🔍</div>
                                            <h3 className="text-xl font-bold">
                                                No institutions found
                                            </h3>
                                            <p className="mt-2 text-slate-500">
                                                Try another location or click Show All.
                                            </p>
                                            <button
                                                onClick={showAllInstitutions}
                                                className="mt-5 rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white"
                                            >
                                                Show All
                                            </button>
                                        </div>
                                    )}

                                    {filteredInstitutions.length > 0 && (
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {filteredInstitutions.map((institution) => (
                                                <InstitutionCard
                                                    key={institution.id}
                                                    institution={institution}
                                                    institutionType={getInstitutionType(institution)}
                                                    fee={getInstitutionFee(institution)}
                                                    navigate={navigate}
                                                    isSaved={savedInstitutions.some(
                                                        (item) => item.id === institution.id
                                                    )}
                                                    isCompared={compareInstitutions.some(
                                                        (item) => item.id === institution.id
                                                    )}
                                                    onToggleSave={toggleSave}
                                                    onToggleCompare={toggleCompare}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function InstitutionCard({
    institution,
    institutionType,
    fee,
    navigate,
    isSaved,
    isCompared,
    onToggleSave,
    onToggleCompare
}) {
    const rating = Number(institution.rating);

    const imageList =
        institution.images ||
        institution.institution_images ||
        [];

    const firstImage = Array.isArray(imageList) && imageList.length > 0
        ? imageList[0]
        : null;

    const imageUrl = typeof firstImage === "string"
        ? firstImage
        : firstImage?.image_url ||
          firstImage?.image ||
          firstImage?.url ||
          institution.image_url ||
          institution.image ||
          "";

    const distance = Number(institution.distance);
    const hasDistance =
        institution.distance !== undefined &&
        institution.distance !== null &&
        institution.distance !== "" &&
        Number.isFinite(distance);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg">

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={institution.name || "Institution"}
                    className="h-44 w-full object-cover"
                    onError={(event) => {
                        event.currentTarget.style.display = "none";
                    }}
                />
            ) : (
                <div className="flex h-28 items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-700">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-md">
                        🎓
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900">
                            {institution.name || "Unnamed Institution"}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                            📍 {institution.location ||
                                institution.district ||
                                institution.state ||
                                "Location not available"}
                        </p>
                    </div>

                    <span className="whitespace-nowrap rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Approved
                    </span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                    <div className="flex text-xl">
                        {Array.from({ length: 5 }, (_, index) => {
                            const fill = Number.isFinite(rating)
                                ? Math.max(0, Math.min(1, rating - index))
                                : 0;

                            return (
                                <span
                                    key={index}
                                    className="bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: `linear-gradient(90deg, #eab308 ${fill * 100}%, #cbd5e1 ${fill * 100}%)`
                                    }}
                                >
                                    ★
                                </span>
                            );
                        })}
                    </div>

                    <span className="font-bold text-slate-800">
                        {Number.isFinite(rating) ? rating.toFixed(1) : "N/A"}
                    </span>

                    <span className="text-sm text-slate-400">
                        ({institution.review_count || 0} reviews)
                    </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase text-slate-400">Fees</p>
                        <p className="mt-1 text-sm font-bold">
                            {fee !== null
                                ? `₹${fee.toLocaleString("en-IN")}`
                                : "Not listed"}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase text-slate-400">
                            Distance
                        </p>
                        <p className="mt-1 text-sm font-bold">
                            {hasDistance
                                ? `${distance.toFixed(1)} km`
                                : "N/A"}
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase text-slate-400">Type</p>
                        <p className="mt-1 text-xs font-bold">
                            {institutionType}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => navigate(`/institution/${institution.id}`)}
                        className="flex-1 rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800"
                    >
                        View Details
                    </button>

                    <button
                        onClick={() => onToggleSave(institution)}
                        className={`rounded-lg border px-4 py-2.5 ${
                            isSaved
                                ? "border-pink-300 bg-pink-50 text-pink-600"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        title={isSaved ? "Remove from Saved" : "Save Institution"}
                    >
                        {isSaved ? "♥" : "♡"}
                    </button>
                </div>

                <button
                    onClick={() => onToggleCompare(institution)}
                    className={`mt-3 w-full rounded-lg border py-2.5 font-medium ${
                        isCompared
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    {isCompared ? "✓ Added to Compare" : "Add to Compare"}
                </button>
            </div>
        </div>
    );
}

function FilterGroup({ title, children }) {
    return (
        <div className="mb-5 border-b border-slate-100 pb-5 last:border-b-0">
            <h4 className="mb-3 text-sm font-bold text-slate-900">
                {title}
            </h4>
            <div className="flex flex-col gap-1">
                {children}
            </div>
        </div>
    );
}

function FilterButton({ label, value, selected, setSelected }) {
    const isSelected = selected === value;

    return (
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm ${
            isSelected
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50"
        }`}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => setSelected(isSelected ? "" : value)}
                className="h-4 w-4 accent-blue-600"
            />
            <span>{label}</span>
        </label>
    );
}

export default SearchResults;
