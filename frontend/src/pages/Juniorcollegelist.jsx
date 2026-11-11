import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Juniorcollegelist() {
    const navigate = useNavigate();

    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form
    const [aggregate, setAggregate] = useState(75);
    const [stream, setStream] = useState("");
    const [city, setCity] = useState("");
    const [distance, setDistance] = useState(10);
    const [fees, setFees] = useState(80000);
    const [collegeType, setCollegeType] = useState("");

    const streams = [
        {
            name: "MPC",
            title: "Maths • Physics • Chemistry",
            icon: "📐",
        },
        {
            name: "BiPC",
            title: "Biology • Physics • Chemistry",
            icon: "🧬",
        },
        {
            name: "MEC",
            title: "Maths • Economics • Commerce",
            icon: "📊",
        },
        {
            name: "CEC",
            title: "Civics • Economics • Commerce",
            icon: "💼",
        },
        {
            name: "HEC",
            title: "History • Economics • Civics",
            icon: "🌐",
        },
        {
            name: "Vocational",
            title: "Career-focused education",
            icon: "🛠️",
        },
    ];

    const cities = [
        "Hyderabad",
        "Secunderabad",
        "Warangal",
        "Karimnagar",
        "Nizamabad",
        "Khammam",
    ];

    const collegeTypes = [
        "Government",
        "Private",
        "Residential",
        "Any",
    ];

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://127.0.0.1:8000/api/institutions/?type=Junior%20College"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch junior colleges");
            }

            const data = await response.json();

            setColleges(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load junior college data.");
        } finally {
            setLoading(false);
        }
    };

    const formatFees = (value) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)} Lakh`;
        }

        return `₹${Math.round(value / 1000)}K`;
    };

    const handleFindColleges = () => {
        fetchColleges();

        setTimeout(() => {
            document
                .getElementById("junior-results")
                ?.scrollIntoView({
                    behavior: "smooth",
                });
        }, 200);
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Location is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                setCity("Hyderabad");
            },
            () => {
                alert(
                    "Unable to access your location. Please enter your city manually."
                );
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#f6f8fc]">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-5 lg:px-8">

                    <div className="h-[74px] flex items-center justify-between">

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

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.28),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(79,70,229,0.20),transparent_35%)]"></div>

                <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-28">

                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">

                        <button
                            onClick={() => navigate("/home")}
                            className="hover:text-white transition"
                        >
                            Home
                        </button>

                        <span>›</span>

                        <span className="text-slate-200">
                            Junior College Finder
                        </span>

                    </div>

                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold tracking-wide">

                            <span>✦</span>

                            INTERMEDIATE COLLEGE FINDER

                        </div>

                        <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">

                            Find the right
                            <span className="block text-blue-400">
                                junior college for you.
                            </span>

                        </h2>

                        <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl">

                            Tell us your academic performance, preferred
                            stream, city and budget to discover junior
                            colleges that match your goals.

                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FORM
            ===================================================== */}

            <main className="max-w-6xl mx-auto px-5 lg:px-8 -mt-16 relative z-10 pb-20">

                <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl shadow-slate-300/40 overflow-hidden">

                    {/* FORM HEADER */}

                    <div className="px-7 sm:px-10 py-7 border-b border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                                🎯
                            </div>

                            <div>

                                <h3 className="text-xl font-extrabold text-slate-900">
                                    Build your college profile
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Your preferences help us find better matches.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-7 sm:p-10">

                        {/* =================================================
                            10TH AGGREGATE
                        ================================================= */}

                        <div>

                            <div className="flex justify-between items-end mb-4">

                                <div>

                                    <label className="text-sm font-bold text-slate-800">
                                        Class 10 Aggregate
                                    </label>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Enter your overall percentage
                                    </p>

                                </div>

                                <div className="text-3xl font-black text-blue-700">
                                    {aggregate}
                                    <span className="text-lg">%</span>
                                </div>

                            </div>

                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={aggregate}
                                onChange={(e) =>
                                    setAggregate(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full accent-blue-700"
                            />

                            <div className="flex justify-between text-xs text-slate-400 mt-2">

                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>

                            </div>

                        </div>


                        {/* =================================================
                            STREAM
                        ================================================= */}

                        <div className="mt-10">

                            <div className="flex justify-between mb-4">

                                <div>

                                    <label className="text-sm font-bold text-slate-800">
                                        Preferred Intermediate Stream
                                    </label>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Choose the stream you want to pursue
                                    </p>

                                </div>

                                <span className="text-xs text-slate-400">
                                    Select one
                                </span>

                            </div>


                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                                {streams.map((item) => {

                                    const selected =
                                        stream === item.name;

                                    return (

                                        <button
                                            key={item.name}
                                            onClick={() =>
                                                setStream(item.name)
                                            }
                                            className={`text-left p-5 rounded-2xl border-2 transition-all ${
                                                selected
                                                    ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                                                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                            }`}
                                        >

                                            <div className="flex justify-between">

                                                <span className="text-2xl">
                                                    {item.icon}
                                                </span>

                                                {selected && (
                                                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                                        ✓
                                                    </span>
                                                )}

                                            </div>

                                            <p
                                                className={`mt-4 font-extrabold ${
                                                    selected
                                                        ? "text-blue-700"
                                                        : "text-slate-900"
                                                }`}
                                            >
                                                {item.name}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                {item.title}
                                            </p>

                                        </button>

                                    );
                                })}

                            </div>

                        </div>


                        {/* =================================================
                            CITY
                        ================================================= */}

                        <div className="mt-10">

                            <div className="flex justify-between mb-3">

                                <label className="text-sm font-bold text-slate-800">
                                    Preferred City
                                </label>

                                <span className="text-xs text-slate-400">
                                    Location
                                </span>

                            </div>


                            <div className="relative">

                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                                    📍
                                </span>

                                <input
                                    value={city}
                                    onChange={(e) =>
                                        setCity(e.target.value)
                                    }
                                    placeholder="Search city or locality"
                                    className="w-full h-14 pl-12 pr-36 rounded-2xl border border-slate-200 bg-slate-50 outline-none font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                />

                                <button
                                    onClick={handleUseLocation}
                                    className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-blue-700 hover:bg-blue-50"
                                >
                                    ◎ My location
                                </button>

                            </div>


                            <div className="flex flex-wrap gap-2 mt-3">

                                {cities.map((item) => (

                                    <button
                                        key={item}
                                        onClick={() =>
                                            setCity(item)
                                        }
                                        className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                        {item}
                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* =================================================
                            DISTANCE + FEES
                        ================================================= */}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">


                            {/* DISTANCE */}

                            <div className="rounded-2xl border border-slate-200 p-6">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                                            Maximum travel distance
                                        </p>

                                        <p className="text-3xl font-black text-slate-900 mt-2">
                                            {distance}
                                            <span className="text-base text-slate-400 ml-1">
                                                km
                                            </span>
                                        </p>

                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        🚗
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


                            {/* FEES */}

                            <div className="rounded-2xl border border-slate-200 p-6">

                                <div className="flex justify-between">

                                    <div>

                                        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                                            Annual fees budget
                                        </p>

                                        <div className="flex items-center mt-2">

                                            <span className="text-3xl font-black">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                value={fees}
                                                onChange={(e) =>
                                                    setFees(
                                                        Number(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                className="w-36 text-3xl font-black outline-none"
                                            />

                                        </div>

                                    </div>

                                    <div className="px-3 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-bold">
                                        {formatFees(fees)}
                                    </div>

                                </div>

                                <input
                                    type="range"
                                    min="10000"
                                    max="300000"
                                    step="5000"
                                    value={fees}
                                    onChange={(e) =>
                                        setFees(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full mt-6 accent-green-600"
                                />

                                <div className="flex justify-between text-xs text-slate-400 mt-2">

                                    <span>₹10K</span>
                                    <span>₹3L+</span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            COLLEGE TYPE
                        ================================================= */}

                        <div className="mt-10">

                            <label className="text-sm font-bold text-slate-800 block mb-4">
                                Preferred College Type
                            </label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                {collegeTypes.map((item) => {

                                    const selected =
                                        collegeType === item;

                                    return (

                                        <button
                                            key={item}
                                            onClick={() =>
                                                setCollegeType(item)
                                            }
                                            className={`p-4 rounded-xl border-2 font-bold text-sm transition ${
                                                selected
                                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                                    : "border-slate-200 text-slate-600 hover:border-blue-300"
                                            }`}
                                        >
                                            {item}
                                        </button>

                                    );
                                })}

                            </div>

                        </div>


                        {/* =================================================
                            SUMMARY
                        ================================================= */}

                        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-100">

                            <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">
                                Your search preferences
                            </p>

                            <div className="flex flex-wrap gap-2">

                                <Preference
                                    icon="📊"
                                    text={`${aggregate}%`}
                                />

                                {stream && (
                                    <Preference
                                        icon="📚"
                                        text={stream}
                                    />
                                )}

                                {city && (
                                    <Preference
                                        icon="📍"
                                        text={city}
                                    />
                                )}

                                <Preference
                                    icon="🚗"
                                    text={`${distance} km`}
                                />

                                <Preference
                                    icon="₹"
                                    text={formatFees(fees)}
                                />

                                {collegeType && (
                                    <Preference
                                        icon="🏫"
                                        text={collegeType}
                                    />
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            FIND BUTTON
                        ================================================= */}

                        <button
                            onClick={handleFindColleges}
                            className="group w-full h-16 mt-7 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-700 to-indigo-700 text-white font-extrabold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                        >

                            <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                                ✦
                            </span>

                            Find My Junior Colleges

                            <span className="text-2xl group-hover:translate-x-1 transition">
                                →
                            </span>

                        </button>

                    </div>

                </div>


                {/* =====================================================
                    RESULTS
                ===================================================== */}

                <section
                    id="junior-results"
                    className="mt-16"
                >

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">

                        <div>

                            <p className="text-xs uppercase tracking-widest text-blue-700 font-extrabold">
                                Discover
                            </p>

                            <h3 className="text-3xl font-black text-slate-900 mt-1">
                                Junior Colleges for you
                            </h3>

                            <p className="text-slate-500 mt-2">
                                Explore junior colleges available in EduLocate.
                            </p>

                        </div>

                        <div className="px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm">

                            <span className="font-black text-slate-900">
                                {colleges.length}
                            </span>

                            <span className="text-sm text-slate-500 ml-1">
                                colleges
                            </span>

                        </div>

                    </div>


                    {loading && (

                        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                            <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin"></div>

                            <p className="mt-5 text-slate-500 font-semibold">
                                Finding junior colleges...
                            </p>

                        </div>

                    )}


                    {!loading && error && (

                        <div className="bg-white rounded-2xl border border-red-200 p-12 text-center">

                            <div className="text-4xl">
                                ⚠️
                            </div>

                            <h3 className="text-xl font-bold mt-4">
                                Unable to load colleges
                            </h3>

                            <p className="text-slate-500 mt-2">
                                {error}
                            </p>

                            <button
                                onClick={fetchColleges}
                                className="mt-5 px-6 py-3 bg-blue-700 text-white rounded-xl font-bold"
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                    {!loading &&
                        !error &&
                        colleges.length === 0 && (

                            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">

                                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                                    🎓
                                </div>

                                <h3 className="text-xl font-extrabold text-slate-900 mt-5">
                                    No junior colleges available
                                </h3>

                                <p className="text-slate-500 mt-2">
                                    Add junior colleges through Django Admin.
                                </p>

                            </div>

                        )}


                    {!loading &&
                        !error &&
                        colleges.length > 0 && (

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {colleges.map((college) => (

                                    <CollegeCard
                                        key={college.id}
                                        college={college}
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
// COLLEGE CARD
// =============================================================

function CollegeCard({ college }) {
    return (
        <div className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-xl transition-all">

            <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl">
                    🎓
                </div>

                <div className="flex-1">

                    <div className="flex justify-between gap-3">

                        <div>

                            <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700">
                                {college.name}
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                                📍 {college.location}
                            </p>

                        </div>

                        <span className="px-2.5 py-1 h-fit rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            Junior College
                        </span>

                    </div>

                </div>

            </div>


            <div className="grid grid-cols-3 gap-3 mt-6">

                <InfoBox
                    title="Rating"
                    value={`⭐ ${college.rating}`}
                />

                <InfoBox
                    title="Fees"
                    value={`₹${Number(
                        college.fees
                    ).toLocaleString("en-IN")}`}
                />

                <InfoBox
                    title="District"
                    value={college.district || "N/A"}
                />

            </div>


            {college.description && (

                <p className="text-sm text-slate-500 mt-5 leading-relaxed line-clamp-2">
                    {college.description}
                </p>

            )}


            <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-100">

                <span className="text-sm text-slate-500">
                    {college.state}
                </span>

                {college.website && (

                    <a
                        href={college.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-700"
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

export default Juniorcollegelist;