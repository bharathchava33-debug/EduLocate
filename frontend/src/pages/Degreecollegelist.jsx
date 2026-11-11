
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Degreecollegelist() {

    const navigate = useNavigate();

    // =========================================================
    // FORM STATES
    // =========================================================

    const [percentage, setPercentage] = useState(75);
    const [course, setCourse] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [entranceExam, setEntranceExam] = useState("");
    const [reservation, setReservation] = useState("");
    const [city, setCity] = useState("");
    const [collegeType, setCollegeType] = useState("");
    const [hostel, setHostel] = useState("");
    const [university, setUniversity] = useState("");
    const [fees, setFees] = useState(80000);
    const [distance, setDistance] = useState(10);

    const [showResults, setShowResults] = useState(false);


    // =========================================================
    // DEGREE COLLEGE DATA
    // =========================================================

    const colleges = [

        {
            id: 1,
            name: "Sunrise Degree College",
            city: "Hyderabad",
            course: "B.Sc",
            specialization: "Computer Science",
            fees: 60000,
            distance: 5,
            rating: 4.4,
            collegeType: "Private",
            hostel: "Yes",
            university: "Osmania University",
            entranceExam: "Merit Based",
            minPercentage: 60,
        },

        {
            id: 2,
            name: "Global Arts & Science College",
            city: "Hyderabad",
            course: "B.Com",
            specialization: "Computer Applications",
            fees: 55000,
            distance: 7,
            rating: 4.2,
            collegeType: "Private",
            hostel: "No",
            university: "Osmania University",
            entranceExam: "Merit Based",
            minPercentage: 55,
        },

        {
            id: 3,
            name: "Warangal Degree College",
            city: "Warangal",
            course: "B.A",
            specialization: "Economics",
            fees: 40000,
            distance: 9,
            rating: 4.1,
            collegeType: "Government",
            hostel: "Yes",
            university: "Kakatiya University",
            entranceExam: "Merit Based",
            minPercentage: 50,
        },

        {
            id: 4,
            name: "Future Science College",
            city: "Karimnagar",
            course: "B.Sc",
            specialization: "Data Science",
            fees: 75000,
            distance: 12,
            rating: 4.5,
            collegeType: "Autonomous",
            hostel: "Yes",
            university: "Kakatiya University",
            entranceExam: "Entrance Exam",
            minPercentage: 65,
        },

        {
            id: 5,
            name: "Hyderabad Management College",
            city: "Hyderabad",
            course: "BBA",
            specialization: "Business Administration",
            fees: 80000,
            distance: 6,
            rating: 4.3,
            collegeType: "Private",
            hostel: "Yes",
            university: "Osmania University",
            entranceExam: "Entrance Exam",
            minPercentage: 60,
        },

        {
            id: 6,
            name: "Nizamabad Commerce College",
            city: "Nizamabad",
            course: "B.Com",
            specialization: "Accounting & Finance",
            fees: 45000,
            distance: 14,
            rating: 4.0,
            collegeType: "Government",
            hostel: "No",
            university: "Telangana University",
            entranceExam: "Merit Based",
            minPercentage: 50,
        },

    ];


    // =========================================================
    // FIND COLLEGES
    // =========================================================

    const handleFindColleges = () => {

        setShowResults(true);

        setTimeout(() => {

            document
                .getElementById("degree-results")
                ?.scrollIntoView({
                    behavior: "smooth",
                });

        }, 100);

    };


    // =========================================================
    // FILTER COLLEGES
    // =========================================================

    const filteredColleges = colleges.filter((college) => {

        const percentageMatch =
            percentage >= college.minPercentage;

        const cityMatch =
            !city || college.city === city;

        const courseMatch =
            !course || college.course === course;

        const specializationMatch =
            !specialization ||
            college.specialization === specialization;

        const feeMatch =
            college.fees <= fees;

        const distanceMatch =
            college.distance <= distance;

        const collegeTypeMatch =
            !collegeType ||
            college.collegeType === collegeType;

        const hostelMatch =
            !hostel ||
            college.hostel === hostel;

        const universityMatch =
            !university ||
            college.university === university;

        const entranceMatch =
            !entranceExam ||
            college.entranceExam === entranceExam;

        return (
            percentageMatch &&
            cityMatch &&
            courseMatch &&
            specializationMatch &&
            feeMatch &&
            distanceMatch &&
            collegeTypeMatch &&
            hostelMatch &&
            universityMatch &&
            entranceMatch
        );

    });


    // =========================================================
    // RESET FILTERS
    // =========================================================

    const clearFilters = () => {

        setPercentage(75);
        setCourse("");
        setSpecialization("");
        setEntranceExam("");
        setReservation("");
        setCity("");
        setCollegeType("");
        setHostel("");
        setUniversity("");
        setFees(80000);
        setDistance(10);
        setShowResults(false);

    };


    return (

        <div className="min-h-screen bg-slate-950">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">

                <div className="max-w-7xl mx-auto px-5 lg:px-8">

                    <div className="h-[72px] flex items-center justify-between">


                        {/* LOGO */}

                        <div
                            onClick={() => navigate("/home")}
                            className="flex items-center gap-3 cursor-pointer"
                        >

                            <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-xl shadow-lg shadow-purple-600/20">
                                🎓
                            </div>

                            <div>

                                <h1 className="text-lg font-bold text-white">
                                    EduLocate
                                </h1>

                                <p className="text-[11px] text-slate-400">
                                    Smart Education Discovery
                                </p>

                            </div>

                        </div>


                        {/* HOME */}

                        <button
                            onClick={() => navigate("/home")}
                            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition"
                        >
                            ← Home
                        </button>

                    </div>

                </div>

            </header>



            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="relative overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-950 to-violet-900/20"></div>

                <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-12 text-center">

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-sm font-medium mb-6">

                        <span>🎓</span>

                        Degree College Finder

                    </div>


                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">

                        Find Your

                        <span className="text-purple-400">
                            {" "}Perfect Degree College
                        </span>

                    </h2>


                    <p className="max-w-2xl mx-auto mt-5 text-slate-400 text-lg leading-relaxed">

                        Tell us your academic performance, preferred
                        course, specialization, budget and location to
                        discover degree colleges that match your goals.

                    </p>

                </div>

            </section>



            {/* =====================================================
                MAIN FORM
            ===================================================== */}

            <main className="max-w-5xl mx-auto px-5 pb-16">

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">


                    {/* FORM HEADER */}

                    <div className="px-7 md:px-10 py-7 border-b border-slate-100">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                                🎯
                            </div>

                            <div>

                                <h3 className="text-xl font-bold text-slate-900">
                                    Degree College Preferences
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    Customize your search based on your requirements
                                </p>

                            </div>

                        </div>

                    </div>



                    <div className="p-7 md:p-10 space-y-10">


                        {/* =================================================
                            ACADEMIC PROFILE
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="📊"
                                title="Academic Profile"
                                subtitle="Tell us about your academic performance"
                            />


                            <div>

                                <div className="flex justify-between mb-3">

                                    <label className="text-sm font-semibold text-slate-700">
                                        Intermediate / 12th Aggregate
                                    </label>

                                    <span className="font-bold text-purple-600">
                                        {percentage}%
                                    </span>

                                </div>


                                <input
                                    type="range"
                                    min="40"
                                    max="100"
                                    value={percentage}
                                    onChange={(e) =>
                                        setPercentage(
                                            Number(e.target.value)
                                        )
                                    }
                                    className="w-full accent-purple-600"
                                />


                                <div className="flex justify-between text-xs text-slate-400 mt-2">

                                    <span>40%</span>

                                    <span>100%</span>

                                </div>

                            </div>

                        </section>



                        {/* =================================================
                            COURSE
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="📚"
                                title="Degree Preference"
                                subtitle="Choose the degree you want to pursue"
                            />


                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                {[
                                    {
                                        name: "B.Sc",
                                        icon: "🔬",
                                    },
                                    {
                                        name: "B.Com",
                                        icon: "💼",
                                    },
                                    {
                                        name: "B.A",
                                        icon: "📖",
                                    },
                                    {
                                        name: "BBA",
                                        icon: "📈",
                                    },
                                ].map((item) => (

                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() =>
                                            setCourse(item.name)
                                        }
                                        className={`p-4 rounded-xl border text-center transition ${
                                            course === item.name
                                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                                : "border-slate-200 text-slate-600 hover:border-purple-300 hover:bg-slate-50"
                                        }`}
                                    >

                                        <div className="text-2xl mb-2">
                                            {item.icon}
                                        </div>

                                        <span className="font-semibold text-sm">
                                            {item.name}
                                        </span>

                                    </button>

                                ))}

                            </div>

                        </section>



                        {/* =================================================
                            SPECIALIZATION
                        ================================================= */}

                        <section>

                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Preferred Specialization
                            </label>

                            <select
                                value={specialization}
                                onChange={(e) =>
                                    setSpecialization(e.target.value)
                                }
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                            >

                                <option value="">
                                    Any Specialization
                                </option>

                                <option value="Computer Science">
                                    Computer Science
                                </option>

                                <option value="Data Science">
                                    Data Science
                                </option>

                                <option value="Computer Applications">
                                    Computer Applications
                                </option>

                                <option value="Accounting & Finance">
                                    Accounting & Finance
                                </option>

                                <option value="Economics">
                                    Economics
                                </option>

                                <option value="Business Administration">
                                    Business Administration
                                </option>

                            </select>

                        </section>



                        {/* =================================================
                            ADMISSION
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="📝"
                                title="Admission Preference"
                                subtitle="Select how you prefer to get admission"
                            />


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                                {[
                                    "Merit Based",
                                    "Entrance Exam",
                                    "Other",
                                ].map((exam) => (

                                    <button
                                        key={exam}
                                        type="button"
                                        onClick={() =>
                                            setEntranceExam(exam)
                                        }
                                        className={`py-3 rounded-xl border text-sm font-semibold transition ${
                                            entranceExam === exam
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "border-slate-200 text-slate-600 hover:border-purple-300"
                                        }`}
                                    >

                                        {exam}

                                    </button>

                                ))}

                            </div>

                        </section>



                        {/* =================================================
                            RESERVATION
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="🏷️"
                                title="Reservation Category"
                                subtitle="Select your applicable category"
                            />


                            <div className="flex flex-wrap gap-3">

                                {[
                                    "General",
                                    "EWS",
                                    "OBC",
                                    "SC",
                                    "ST",
                                ].map((item) => (

                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            setReservation(item)
                                        }
                                        className={`px-6 py-3 rounded-xl border font-semibold text-sm transition ${
                                            reservation === item
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "border-slate-200 text-slate-600 hover:border-slate-400"
                                        }`}
                                    >

                                        {item}

                                    </button>

                                ))}

                            </div>

                        </section>



                        {/* =================================================
                            COLLEGE TYPE
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="🏫"
                                title="College Type"
                                subtitle="Choose the type of institution you prefer"
                            />


                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                                {[
                                    "Government",
                                    "Private",
                                    "Autonomous",
                                ].map((type) => (

                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() =>
                                            setCollegeType(type)
                                        }
                                        className={`py-3 rounded-xl border font-semibold text-sm transition ${
                                            collegeType === type
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "border-slate-200 text-slate-600 hover:border-purple-300"
                                        }`}
                                    >

                                        {type}

                                    </button>

                                ))}

                            </div>

                        </section>



                        {/* =================================================
                            UNIVERSITY
                        ================================================= */}

                        <section>

                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Preferred University / Affiliation
                            </label>


                            <select
                                value={university}
                                onChange={(e) =>
                                    setUniversity(e.target.value)
                                }
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                            >

                                <option value="">
                                    Any University
                                </option>

                                <option value="Osmania University">
                                    Osmania University
                                </option>

                                <option value="Kakatiya University">
                                    Kakatiya University
                                </option>

                                <option value="Telangana University">
                                    Telangana University
                                </option>

                            </select>

                        </section>



                        {/* =================================================
                            HOSTEL
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="🏠"
                                title="Hostel Requirement"
                                subtitle="Do you need hostel accommodation?"
                            />


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                {[
                                    "Yes",
                                    "No",
                                ].map((item) => (

                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() =>
                                            setHostel(item)
                                        }
                                        className={`py-3 rounded-xl border font-semibold text-sm transition ${
                                            hostel === item
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "border-slate-200 text-slate-600 hover:border-purple-300"
                                        }`}
                                    >

                                        {item === "Yes"
                                            ? "🏠 Yes, I need hostel"
                                            : "🏡 No hostel required"
                                        }

                                    </button>

                                ))}

                            </div>

                        </section>



                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="📍"
                                title="Location & Travel"
                                subtitle="Choose where you want to study"
                            />


                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Preferred City
                            </label>


                            <select
                                value={city}
                                onChange={(e) =>
                                    setCity(e.target.value)
                                }
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                            >

                                <option value="">
                                    Any City
                                </option>

                                <option value="Hyderabad">
                                    Hyderabad
                                </option>

                                <option value="Warangal">
                                    Warangal
                                </option>

                                <option value="Karimnagar">
                                    Karimnagar
                                </option>

                                <option value="Nizamabad">
                                    Nizamabad
                                </option>

                                <option value="Khammam">
                                    Khammam
                                </option>

                            </select>



                            {/* DISTANCE */}

                            <div className="mt-8">

                                <div className="flex justify-between mb-3">

                                    <label className="text-sm font-semibold text-slate-700">
                                        Maximum Travel Distance
                                    </label>

                                    <span className="font-bold text-emerald-600">
                                        {distance} km
                                    </span>

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
                                    className="w-full accent-emerald-600"
                                />


                                <div className="flex justify-between text-xs text-slate-400 mt-2">

                                    <span>1 km</span>

                                    <span>50 km</span>

                                </div>

                            </div>

                        </section>



                        {/* =================================================
                            FEES
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon="💰"
                                title="Budget"
                                subtitle="Set your maximum annual degree fees"
                            />


                            <div className="flex justify-between mb-3">

                                <label className="text-sm font-semibold text-slate-700">
                                    Maximum Annual Fees
                                </label>

                                <span className="font-bold text-purple-600">
                                    ₹{fees.toLocaleString("en-IN")}
                                </span>

                            </div>


                            <input
                                type="range"
                                min="20000"
                                max="200000"
                                step="5000"
                                value={fees}
                                onChange={(e) =>
                                    setFees(
                                        Number(e.target.value)
                                    )
                                }
                                className="w-full accent-purple-600"
                            />


                            <div className="flex justify-between text-xs text-slate-400 mt-2">

                                <span>₹20K</span>

                                <span>₹2L+</span>

                            </div>

                        </section>



                        {/* =================================================
                            SEARCH SUMMARY
                        ================================================= */}

                        <div className="rounded-2xl bg-slate-900 p-6">

                            <p className="text-xs uppercase tracking-widest text-slate-400 mb-5">
                                Your Degree Search
                            </p>


                            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">

                                <Summary
                                    icon="📊"
                                    label="Aggregate"
                                    value={`${percentage}%`}
                                />

                                <Summary
                                    icon="📚"
                                    label="Degree"
                                    value={course || "Any Degree"}
                                />

                                <Summary
                                    icon="📍"
                                    label="City"
                                    value={city || "Any City"}
                                />

                                <Summary
                                    icon="🏫"
                                    label="College"
                                    value={collegeType || "Any Type"}
                                />

                                <Summary
                                    icon="📏"
                                    label="Distance"
                                    value={`${distance} km`}
                                />

                            </div>

                        </div>



                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="flex flex-col md:flex-row gap-3">


                            <button
                                onClick={handleFindColleges}
                                className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-bold text-lg hover:bg-purple-700 transition shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3"
                            >

                                <span>🔍</span>

                                Find Degree Colleges

                                <span>→</span>

                            </button>


                            <button
                                onClick={clearFilters}
                                className="md:w-40 py-4 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                            >

                                Clear Filters

                            </button>

                        </div>


                    </div>

                </div>



                {/* =====================================================
                    RESULTS
                ===================================================== */}

                {showResults && (

                    <section
                        id="degree-results"
                        className="mt-12"
                    >


                        <div className="flex items-end justify-between mb-6">

                            <div>

                                <p className="text-purple-400 text-sm font-semibold tracking-wider">
                                    MATCHING COLLEGES
                                </p>

                                <h3 className="text-2xl font-bold text-white mt-1">
                                    Degree Colleges For You
                                </h3>

                            </div>


                            <span className="text-slate-400 text-sm">
                                {filteredColleges.length} matches
                            </span>

                        </div>



                        {filteredColleges.length === 0 ? (

                            <div className="bg-white rounded-2xl p-10 text-center">

                                <div className="text-5xl mb-4">
                                    🔎
                                </div>

                                <h3 className="text-xl font-bold text-slate-900">
                                    No matching degree colleges found
                                </h3>

                                <p className="text-slate-500 mt-2">
                                    Try increasing your budget, percentage
                                    range or travel distance.
                                </p>

                                <button
                                    onClick={clearFilters}
                                    className="mt-5 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
                                >
                                    Reset Filters
                                </button>

                            </div>

                        ) : (

                            <div className="grid md:grid-cols-2 gap-6">

                                {filteredColleges.map((college) => (

                                    <div
                                        key={college.id}
                                        className="bg-white rounded-2xl p-6 hover:shadow-2xl transition"
                                    >


                                        {/* CARD HEADER */}

                                        <div className="flex justify-between gap-4">

                                            <div>

                                                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                                                    Degree College
                                                </span>


                                                <h4 className="text-lg font-bold text-slate-900 mt-3">
                                                    {college.name}
                                                </h4>


                                                <p className="text-sm text-slate-500 mt-1">
                                                    📍 {college.city}
                                                </p>

                                            </div>


                                            <div className="text-yellow-500 font-bold">
                                                ★ {college.rating}
                                            </div>

                                        </div>



                                        {/* COLLEGE INFO */}

                                        <div className="grid grid-cols-2 gap-3 mt-5">

                                            <InfoBox
                                                label="Course"
                                                value={college.course}
                                            />

                                            <InfoBox
                                                label="Specialization"
                                                value={college.specialization}
                                            />

                                            <InfoBox
                                                label="Fees"
                                                value={`₹${college.fees.toLocaleString(
                                                    "en-IN"
                                                )}`}
                                            />

                                            <InfoBox
                                                label="Distance"
                                                value={`${college.distance} km`}
                                            />

                                        </div>



                                        {/* EXTRA DETAILS */}

                                        <div className="flex flex-wrap gap-2 mt-4">

                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
                                                🏫 {college.collegeType}
                                            </span>

                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
                                                🏠 Hostel: {college.hostel}
                                            </span>

                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
                                                🎓 {college.university}
                                            </span>

                                        </div>



                                        {/* MATCH */}

                                        <div className="mt-5 p-4 rounded-xl bg-purple-50 border border-purple-100">

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="text-xs text-purple-500 font-semibold uppercase">
                                                        EduLocate Match
                                                    </p>

                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Suitable based on your preferences
                                                    </p>

                                                </div>


                                                <div className="text-2xl font-bold text-purple-600">
                                                    {calculateMatch(
                                                        college,
                                                        {
                                                            percentage,
                                                            course,
                                                            specialization,
                                                            city,
                                                            fees,
                                                            distance,
                                                            collegeType,
                                                            hostel,
                                                            university,
                                                            entranceExam,
                                                        }
                                                    )}%
                                                </div>

                                            </div>

                                        </div>



                                        {/* VIEW BUTTON */}

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/institution/${college.id}`
                                                )
                                            }
                                            className="w-full mt-5 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
                                        >

                                            View College

                                        </button>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                )}

            </main>

        </div>

    );

}


// =============================================================
// MATCH SCORE
// =============================================================

function calculateMatch(college, preferences) {

    let score = 0;

    let total = 0;


    // Course
    if (preferences.course) {

        total += 25;

        if (college.course === preferences.course) {
            score += 25;
        }

    }


    // Specialization
    if (preferences.specialization) {

        total += 15;

        if (
            college.specialization ===
            preferences.specialization
        ) {
            score += 15;
        }

    }


    // Budget
    total += 15;

    if (college.fees <= preferences.fees) {
        score += 15;
    }


    // Distance
    total += 15;

    if (college.distance <= preferences.distance) {
        score += 15;
    }


    // City
    if (preferences.city) {

        total += 10;

        if (college.city === preferences.city) {
            score += 10;
        }

    }


    // College Type
    if (preferences.collegeType) {

        total += 5;

        if (
            college.collegeType ===
            preferences.collegeType
        ) {
            score += 5;
        }

    }


    // Hostel
    if (preferences.hostel) {

        total += 5;

        if (college.hostel === preferences.hostel) {
            score += 5;
        }

    }


    // University
    if (preferences.university) {

        total += 5;

        if (
            college.university ===
            preferences.university
        ) {
            score += 5;
        }

    }


    // Percentage eligibility
    total += 5;

    if (
        preferences.percentage >=
        college.minPercentage
    ) {
        score += 5;
    }


    if (total === 0) {
        return 100;
    }


    return Math.round(
        (score / total) * 100
    );

}


// =============================================================
// SECTION TITLE
// =============================================================

function SectionTitle({
    icon,
    title,
    subtitle,
}) {

    return (

        <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                {icon}
            </div>

            <div>

                <h4 className="font-bold text-slate-900">
                    {title}
                </h4>

                <p className="text-xs text-slate-500">
                    {subtitle}
                </p>

            </div>

        </div>

    );

}


// =============================================================
// SUMMARY
// =============================================================

function Summary({
    icon,
    label,
    value,
}) {

    return (

        <div className="min-w-0">

            <div className="text-lg mb-1">
                {icon}
            </div>

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="font-semibold text-white mt-1 truncate">
                {value}
            </p>

        </div>

    );

}


// =============================================================
// INFO BOX
// =============================================================

function InfoBox({
    label,
    value,
}) {

    return (

        <div className="bg-slate-50 rounded-xl p-3">

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="text-sm font-bold text-slate-800 mt-1">
                {value}
            </p>

        </div>

    );

}


export default Degreecollegelist;

