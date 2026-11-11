import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SchoolList() {
    const navigate = useNavigate();

    // =========================================================
    // SCHOOL DATA
    // =========================================================

    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // FORM STATES
    // =========================================================

    const [location, setLocation] = useState("");
    const [budget, setBudget] = useState(80000);
    const [distance, setDistance] = useState(13);
    const [board, setBoard] = useState("");
    const [grade, setGrade] = useState("");

    // =========================================================
    // LOCATION SUGGESTIONS
    // =========================================================

    const locations = [
        "Hyderabad",
        "Secunderabad",
        "Warangal",
        "Karimnagar",
        "Nizamabad",
        "Khammam",
        "Nalgonda",
        "Adilabad",
        "Mahbubnagar",
        "Siddipet",
    ];

    // =========================================================
    // BOARDS
    // =========================================================

    const boards = [
        {
            name: "CBSE",
            description: "Central Board",
            icon: "📘",
        },
        {
            name: "ICSE",
            description: "Council Board",
            icon: "📚",
        },
        {
            name: "State Board",
            description: "Telangana Board",
            icon: "🏛️",
        },
        {
            name: "IB",
            description: "International",
            icon: "🌎",
        },
    ];

    // =========================================================
    // GRADES
    // =========================================================

    const grades = [
        "1st",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
    ];

    // =========================================================
    // FETCH SCHOOLS
    // =========================================================

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/api/institutions/?type=School"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch schools");
            }

            const data = await response.json();

            setSchools(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load school data.");
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FIND SCHOOLS
    // =========================================================

    const handleFindSchools = () => {
        fetchSchools();

        setTimeout(() => {
            document
                .getElementById("school-results")
                ?.scrollIntoView({
                    behavior: "smooth",
                });
        }, 200);
    };

    // =========================================================
    // USE LOCATION
    // =========================================================

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Location access is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                setLocation("Hyderabad");
            },
            () => {
                alert(
                    "Unable to access your location. Please enter your city manually."
                );
            }
        );
    };

    // =========================================================
    // FORMAT MONEY
    // =========================================================

    const formatMoney = (value) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)} Lakh`;
        }

        return `₹${Math.round(value / 1000)}K`;
    };

    return (
        <div className="min-h-screen bg-[#f6f8fc]">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-5 lg:px-8">

                    <div className="h-[74px] flex items-center justify-between">

                        {/* LOGO */}

                        <div
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-3 cursor-pointer"
                        >

                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center text-xl shadow-lg shadow-blue-200">
                                🎓
                            </div>

                            <div>

                                <h1 className="text-xl font-extrabold text-slate-900">
                                    EduLocate
                                </h1>

                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                                    Smart Education Discovery
                                </p>

                            </div>

                        </div>


                        {/* NAVIGATION */}

                        <nav className="hidden lg:flex items-center gap-1">

                            <NavButton
                                label="Home"
                                onClick={() => navigate("/home")}
                            />

                            <NavButton
                                label="Compare"
                                onClick={() => navigate("/compare")}
                            />

                            <NavButton
                                label="Cost Calc"
                                onClick={() =>
                                    navigate("/cost-calculator")
                                }
                            />

                            <NavButton
                                label="Cutoffs"
                                onClick={() => navigate("/cutoffs")}
                            />

                            <NavButton
                                label="AI Advisor"
                                onClick={() =>
                                    navigate("/ai-advisor")
                                }
                            />

                            <NavButton
                                label="Saved"
                                onClick={() => navigate("/saved")}
                            />

                        </nav>


                        <button
                            onClick={() => navigate("/home")}
                            className="lg:hidden w-10 h-10 rounded-xl border border-slate-200"
                        >
                            ☰
                        </button>

                    </div>

                </div>

            </header>


            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="relative overflow-hidden bg-slate-950">

                {/* Background */}

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.28),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(79,70,229,0.20),transparent_35%)]"></div>


                <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-28">

                    {/* Breadcrumb */}

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">

                        <button
                            onClick={() => navigate("/home")}
                            className="hover:text-white transition"
                        >
                            Home
                        </button>

                        <span>›</span>

                        <span className="text-slate-200">
                            School Finder
                        </span>

                    </div>


                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold tracking-wide">

                            <span>✦</span>

                            PERSONALIZED SCHOOL FINDER

                        </div>


                        <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">

                            Find a school
                            <span className="block text-blue-400">
                                made for your future.
                            </span>

                        </h2>


                        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">

                            Tell us what matters to you and EduLocate
                            will help you discover schools that match
                            your preferences.

                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MAIN FORM
            ===================================================== */}

            <main className="max-w-6xl mx-auto px-5 lg:px-8 -mt-16 relative z-10 pb-20">

                <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl shadow-slate-300/40 overflow-hidden">


                    {/* FORM HEADER */}

                    <div className="px-7 sm:px-10 py-7 border-b border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                                ✨
                            </div>

                            <div>

                                <h3 className="text-xl font-extrabold text-slate-900">
                                    Build your school profile
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Choose your preferences and discover
                                    suitable schools.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-7 sm:p-10">


                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        <div>

                            <div className="flex items-center justify-between mb-3">

                                <label className="text-sm font-bold text-slate-800">
                                    Where do you want to study?
                                </label>

                                <span className="text-xs font-semibold text-slate-400">
                                    REQUIRED
                                </span>

                            </div>


                            <div className="relative">

                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                                    📍
                                </div>


                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    placeholder="Enter city, area or locality"
                                    className="w-full h-14 pl-12 pr-36 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                />


                                <button
                                    onClick={handleUseLocation}
                                    className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-blue-700 hover:bg-blue-50 transition"
                                >
                                    ◎ Use my location
                                </button>

                            </div>


                            {/* Suggestions */}

                            <div className="flex flex-wrap gap-2 mt-3">

                                {locations.slice(0, 6).map((item) => (

                                    <button
                                        key={item}
                                        onClick={() =>
                                            setLocation(item)
                                        }
                                        className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition"
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* =================================================
                            BUDGET + DISTANCE
                        ================================================= */}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-9">


                            {/* BUDGET */}

                            <div className="rounded-2xl border border-slate-200 p-6">

                                <div className="flex justify-between items-start">

                                    <div>

                                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                                            Annual budget
                                        </p>

                                        <div className="flex items-center gap-1 mt-2">

                                            <span className="text-3xl font-black text-slate-900">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                value={budget}
                                                onChange={(e) =>
                                                    setBudget(
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-36 text-3xl font-black text-slate-900 outline-none"
                                            />

                                        </div>

                                    </div>


                                    <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold">
                                        {formatMoney(budget)}
                                    </div>

                                </div>


                                <input
                                    type="range"
                                    min="20000"
                                    max="500000"
                                    step="5000"
                                    value={budget}
                                    onChange={(e) =>
                                        setBudget(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full mt-6 accent-blue-700"
                                />


                                <div className="flex justify-between text-xs text-slate-400 mt-2">

                                    <span>₹20K</span>

                                    <span>₹5L+</span>

                                </div>

                            </div>


                            {/* DISTANCE */}

                            <div className="rounded-2xl border border-slate-200 p-6">

                                <div className="flex justify-between items-start">

                                    <div>

                                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                                            Maximum distance
                                        </p>

                                        <p className="text-3xl font-black text-slate-900 mt-2">
                                            {distance}
                                            <span className="text-base font-bold text-slate-400 ml-1">
                                                km
                                            </span>
                                        </p>

                                    </div>


                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
                                        📍
                                    </div>

                                </div>


                                <input
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={distance}
                                    onChange={(e) =>
                                        setDistance(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full mt-6 accent-indigo-600"
                                />


                                <div className="flex justify-between text-xs text-slate-400 mt-2">

                                    <span>1 km</span>

                                    <span>50 km</span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            BOARD
                        ================================================= */}

                        <div className="mt-9">

                            <div className="flex items-center justify-between mb-4">

                                <label className="text-sm font-bold text-slate-800">
                                    Preferred education board
                                </label>

                                <span className="text-xs text-slate-400">
                                    Select one
                                </span>

                            </div>


                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                                {boards.map((item) => {

                                    const selected =
                                        board === item.name;

                                    return (

                                        <button
                                            key={item.name}
                                            onClick={() =>
                                                setBoard(item.name)
                                            }
                                            className={`text-left p-4 rounded-2xl border-2 transition-all ${
                                                selected
                                                    ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                            }`}
                                        >

                                            <div className="flex items-center justify-between">

                                                <span className="text-2xl">
                                                    {item.icon}
                                                </span>

                                                {selected && (

                                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                                        ✓
                                                    </span>

                                                )}

                                            </div>


                                            <p className={`mt-4 font-extrabold ${
                                                selected
                                                    ? "text-blue-700"
                                                    : "text-slate-800"
                                            }`}>
                                                {item.name}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                {item.description}
                                            </p>

                                        </button>

                                    );
                                })}

                            </div>

                        </div>


                        {/* =================================================
                            GRADE
                        ================================================= */}

                        <div className="mt-9">

                            <label className="text-sm font-bold text-slate-800 block mb-3">
                                Which class are you looking for?
                            </label>


                            <div className="relative">

                                <select
                                    value={grade}
                                    onChange={(e) =>
                                        setGrade(e.target.value)
                                    }
                                    className="appearance-none w-full h-14 px-5 pr-12 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition cursor-pointer"
                                >

                                    <option value="">
                                        Select class / grade
                                    </option>

                                    {grades.map((item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item} Class
                                        </option>

                                    ))}

                                </select>


                                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                                    ▼
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            SEARCH SUMMARY
                        ================================================= */}

                        <div className="mt-9 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-100">

                            <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">
                                Search preferences
                            </p>


                            <div className="flex flex-wrap gap-2">

                                {location && (
                                    <Preference
                                        icon="📍"
                                        text={location}
                                    />
                                )}

                                <Preference
                                    icon="₹"
                                    text={formatMoney(budget)}
                                />

                                <Preference
                                    icon="⌖"
                                    text={`${distance} km`}
                                />

                                {board && (
                                    <Preference
                                        icon="📚"
                                        text={board}
                                    />
                                )}

                                {grade && (
                                    <Preference
                                        icon="🎓"
                                        text={`${grade} Class`}
                                    />
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            FIND BUTTON
                        ================================================= */}

                        <button
                            onClick={handleFindSchools}
                            className="group w-full h-16 mt-7 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-700 to-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                        >

                            <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                                ⌕
                            </span>

                            Find My Schools

                            <span className="text-2xl group-hover:translate-x-1 transition">
                                →
                            </span>

                        </button>


                        <p className="text-center text-xs text-slate-400 mt-4">
                            We'll use your preferences to show the most relevant schools.
                        </p>

                    </div>

                </div>


                {/* =====================================================
                    RESULTS
                ===================================================== */}

                <section
                    id="school-results"
                    className="mt-16"
                >

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">

                        <div>

                            <p className="text-xs uppercase tracking-widest text-blue-700 font-extrabold">
                                Discover
                            </p>

                            <h3 className="text-3xl font-black text-slate-900 mt-1">
                                Schools for you
                            </h3>

                            <p className="text-slate-500 mt-2">
                                Explore schools available in EduLocate.
                            </p>

                        </div>


                        <div className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm">

                            <span className="font-black text-slate-900">
                                {schools.length}
                            </span>

                            <span className="text-sm text-slate-500 ml-1">
                                schools
                            </span>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                            <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin"></div>

                            <p className="mt-5 text-slate-500 font-semibold">
                                Finding schools...
                            </p>

                        </div>

                    )}


                    {/* ERROR */}

                    {!loading && error && (

                        <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">

                            <div className="text-4xl">
                                ⚠️
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mt-4">
                                Unable to load schools
                            </h3>

                            <p className="text-slate-500 mt-2">
                                {error}
                            </p>

                            <button
                                onClick={fetchSchools}
                                className="mt-5 px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800"
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                    {/* NO DATA */}

                    {!loading &&
                        !error &&
                        schools.length === 0 && (

                            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                                    🏫
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mt-5">
                                    No schools available
                                </h3>

                                <p className="text-slate-500 mt-2">
                                    Add schools through the Django admin panel.
                                </p>

                            </div>

                        )}


                    {/* SCHOOL CARDS */}

                    {!loading &&
                        !error &&
                        schools.length > 0 && (

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {schools.map((school) => (

                                    <SchoolCard
                                        key={school.id}
                                        school={school}
                                    />

                                ))}

                            </div>

                        )}

                </section>

            </main>

        </div>
    );
}


// =============================================================
// NAV BUTTON
// =============================================================

function NavButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition"
        >
            {label}
        </button>
    );
}


// =============================================================
// PREFERENCE
// =============================================================

function Preference({ icon, text }) {
    return (
        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
            <span>{icon}</span>
            {text}
        </span>
    );
}


// =============================================================
// SCHOOL CARD
// =============================================================

function SchoolCard({ school }) {
    return (

        <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all">

            <div className="flex items-start gap-4">

                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl">
                    🏫
                </div>


                <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">

                        <div>

                            <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                                {school.name}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                                📍 {school.location}
                            </p>

                        </div>


                        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                            School
                        </span>

                    </div>

                </div>

            </div>


            <div className="grid grid-cols-3 gap-3 mt-6">

                <InfoBox
                    title="Rating"
                    value={`⭐ ${school.rating}`}
                />

                <InfoBox
                    title="Annual Fees"
                    value={`₹${Number(
                        school.fees
                    ).toLocaleString("en-IN")}`}
                />

                <InfoBox
                    title="District"
                    value={school.district || "N/A"}
                />

            </div>


            {school.description && (

                <p className="text-sm text-slate-500 leading-relaxed mt-5 line-clamp-2">
                    {school.description}
                </p>

            )}


            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">

                <span className="text-sm font-medium text-slate-500">
                    {school.state}
                </span>


                {school.website && (

                    <a
                        href={school.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-700 hover:text-blue-800"
                    >
                        Visit Website →
                    </a>

                )}

            </div>

        </div>
    );
}


// =============================================================
// INFO BOX
// =============================================================

function InfoBox({ title, value }) {
    return (
        <div className="bg-slate-50 rounded-xl p-3">

            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {title}
            </p>

            <p className="font-bold text-slate-900 mt-1 text-sm truncate">
                {value}
            </p>

        </div>
    );
}


// =============================================================
// EXPORT
// =============================================================

export default SchoolList;