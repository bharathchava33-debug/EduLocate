import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Engineeringcollegelist() {
    const navigate = useNavigate();

    // =====================================================
    // FORM STATES
    // =====================================================

    const [percentage, setPercentage] = useState(75);
    const [entranceExam, setEntranceExam] = useState("");
    const [rank, setRank] = useState("");
    const [branch, setBranch] = useState("");
    const [reservation, setReservation] = useState("");
    const [city, setCity] = useState("");
    const [distance, setDistance] = useState(10);
    const [fees, setFees] = useState(100000);

    const [showResults, setShowResults] = useState(false);

    // =====================================================
    // SAMPLE COLLEGE DATA
    // =====================================================

    const colleges = [
        {
            id: 1,
            name: "ABC Institute of Technology",
            city: "Hyderabad",
            branch: "Computer Science Engineering",
            fees: 85000,
            distance: 5,
            rating: 4.5,
        },
        {
            id: 2,
            name: "Future Engineering College",
            city: "Hyderabad",
            branch: "Artificial Intelligence & Machine Learning",
            fees: 95000,
            distance: 8,
            rating: 4.6,
        },
        {
            id: 3,
            name: "Warangal Institute of Technology",
            city: "Warangal",
            branch: "Electronics & Communication Engineering",
            fees: 70000,
            distance: 10,
            rating: 4.3,
        },
        {
            id: 4,
            name: "Karimnagar College of Engineering",
            city: "Karimnagar",
            branch: "Mechanical Engineering",
            fees: 65000,
            distance: 12,
            rating: 4.1,
        },
        {
            id: 5,
            name: "Hyderabad School of Engineering",
            city: "Hyderabad",
            branch: "Information Technology",
            fees: 90000,
            distance: 7,
            rating: 4.4,
        },
    ];

    // =====================================================
    // BRANCHES
    // =====================================================

    const branches = [
        "Computer Science Engineering",
        "Artificial Intelligence & Machine Learning",
        "Information Technology",
        "Electronics & Communication Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
    ];

    // =====================================================
    // FILTER COLLEGES
    // =====================================================

    const filteredColleges = colleges.filter((college) => {
        const cityMatch =
            !city || college.city === city;

        const branchMatch =
            !branch || college.branch === branch;

        const feeMatch =
            college.fees <= fees;

        const distanceMatch =
            college.distance <= distance;

        return (
            cityMatch &&
            branchMatch &&
            feeMatch &&
            distanceMatch
        );
    });

    // =====================================================
    // FIND COLLEGES
    // =====================================================

    const handleFindColleges = () => {
        setShowResults(true);

        setTimeout(() => {
            document
                .getElementById("results")
                ?.scrollIntoView({
                    behavior: "smooth",
                });
        }, 100);
    };

    // =====================================================
    // RESET
    // =====================================================

    const resetForm = () => {
        setPercentage(75);
        setEntranceExam("");
        setRank("");
        setBranch("");
        setReservation("");
        setCity("");
        setDistance(10);
        setFees(100000);
        setShowResults(false);
    };

    return (
        <div
            className="
                min-h-screen
                bg-gradient-to-br
                from-[#24134f]
                via-[#633c82]
                to-[#d58b9c]
                relative
                overflow-x-hidden
            "
        >

            {/* =================================================
                BACKGROUND EFFECT
            ================================================= */}

            <div className="fixed inset-0 bg-black/20 pointer-events-none"></div>


            {/* =================================================
                TOP NAVIGATION
            ================================================= */}

            <div className="relative z-10 max-w-5xl mx-auto px-5 pt-5">

                <div className="flex justify-between items-center">

                    {/* Browser dots */}

                    <div className="flex gap-2">

                        <span className="w-3 h-3 rounded-full bg-red-500"></span>

                        <span className="w-3 h-3 rounded-full bg-yellow-400"></span>

                        <span className="w-3 h-3 rounded-full bg-green-400"></span>

                    </div>


                    <button
                        onClick={() => navigate("/home")}
                        className="
                            text-white/70
                            hover:text-white
                            text-sm
                            transition
                        "
                    >
                        ← Home
                    </button>

                </div>

            </div>


            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div className="relative z-10 text-center pt-8 pb-5 px-5">

                <h1
                    className="
                        text-3xl
                        md:text-4xl
                        font-light
                        text-white
                        tracking-wide
                    "
                >
                    Engineering College Finder
                </h1>

                <p className="text-white/70 text-sm mt-2">
                    Find the right engineering college for your future
                </p>

            </div>


            {/* =================================================
                MAIN FORM
            ================================================= */}

            <main className="relative z-10 px-5 pb-12">

                <div className="w-full max-w-md mx-auto">


                    {/* =================================================
                        FORM CARD
                    ================================================= */}

                    <div
                        className="
                            bg-white/20
                            backdrop-blur-md
                            border
                            border-white/20
                            shadow-2xl
                            rounded-none
                            overflow-hidden
                        "
                    >

                        {/* =================================================
                            FLAT TABS
                        ================================================= */}

                        <div className="grid grid-cols-2">

                            <button
                                className="
                                    py-3
                                    text-sm
                                    font-semibold
                                    bg-[#493181]
                                    text-white
                                "
                            >
                                College Finder
                            </button>

                            <button
                                onClick={() => {
                                    if (showResults) {
                                        document
                                            .getElementById("results")
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            });
                                    }
                                }}
                                className="
                                    py-3
                                    text-sm
                                    font-semibold
                                    bg-white/30
                                    text-white
                                    hover:bg-white/40
                                    transition
                                "
                            >
                                Results
                            </button>

                        </div>


                        {/* =================================================
                            FORM CONTENT
                        ================================================= */}

                        <div className="px-6 py-6">


                            {/* =================================================
                                AGGREGATE
                            ================================================= */}

                            <FormField label="Intermediate / 12th Aggregate">

                                <div className="flex items-center gap-3">

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
                                        className="
                                            w-full
                                            accent-[#493181]
                                        "
                                    />

                                    <span
                                        className="
                                            bg-white
                                            text-gray-700
                                            text-xs
                                            font-semibold
                                            px-3
                                            py-2
                                            min-w-[55px]
                                            text-center
                                        "
                                    >
                                        {percentage}%
                                    </span>

                                </div>

                            </FormField>


                            {/* =================================================
                                ENTRANCE EXAM
                            ================================================= */}

                            <FormField label="Entrance Examination">

                                <select
                                    value={entranceExam}
                                    onChange={(e) =>
                                        setEntranceExam(
                                            e.target.value
                                        )
                                    }
                                    className="flatInput"
                                >

                                    <option value="">
                                        Select Entrance Exam
                                    </option>

                                    <option value="EAMCET">
                                        EAMCET
                                    </option>

                                    <option value="JEE">
                                        JEE Main
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </FormField>


                            {/* =================================================
                                RANK
                            ================================================= */}

                            <FormField label="Entrance Exam Rank">

                                <input
                                    type="number"
                                    value={rank}
                                    onChange={(e) =>
                                        setRank(e.target.value)
                                    }
                                    placeholder="Enter your rank"
                                    className="flatInput"
                                />

                            </FormField>


                            {/* =================================================
                                BRANCH
                            ================================================= */}

                            <FormField label="Engineering Branch">

                                <select
                                    value={branch}
                                    onChange={(e) =>
                                        setBranch(e.target.value)
                                    }
                                    className="flatInput"
                                >

                                    <option value="">
                                        Select Engineering Branch
                                    </option>

                                    {branches.map((item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    ))}

                                </select>

                            </FormField>


                            {/* =================================================
                                RESERVATION
                            ================================================= */}

                            <FormField label="Reservation Category">

                                <select
                                    value={reservation}
                                    onChange={(e) =>
                                        setReservation(
                                            e.target.value
                                        )
                                    }
                                    className="flatInput"
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="General">
                                        General
                                    </option>

                                    <option value="EWS">
                                        EWS
                                    </option>

                                    <option value="OBC">
                                        OBC
                                    </option>

                                    <option value="SC">
                                        SC
                                    </option>

                                    <option value="ST">
                                        ST
                                    </option>

                                </select>

                            </FormField>


                            {/* =================================================
                                CITY
                            ================================================= */}

                            <FormField label="Preferred City">

                                <select
                                    value={city}
                                    onChange={(e) =>
                                        setCity(e.target.value)
                                    }
                                    className="flatInput"
                                >

                                    <option value="">
                                        Select City
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

                                </select>

                            </FormField>


                            {/* =================================================
                                TRAVEL DISTANCE
                            ================================================= */}

                            <FormField label="Maximum Travel Distance">

                                <div className="flex items-center gap-3">

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
                                        className="
                                            w-full
                                            accent-[#493181]
                                        "
                                    />

                                    <span
                                        className="
                                            bg-white
                                            text-gray-700
                                            text-xs
                                            font-semibold
                                            px-3
                                            py-2
                                            min-w-[60px]
                                            text-center
                                        "
                                    >
                                        {distance} km
                                    </span>

                                </div>

                            </FormField>


                            {/* =================================================
                                FEES
                            ================================================= */}

                            <FormField label="Maximum Annual Fees">

                                <div className="flex items-center gap-3">

                                    <input
                                        type="range"
                                        min="30000"
                                        max="200000"
                                        step="5000"
                                        value={fees}
                                        onChange={(e) =>
                                            setFees(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="
                                            w-full
                                            accent-[#493181]
                                        "
                                    />

                                    <span
                                        className="
                                            bg-white
                                            text-gray-700
                                            text-xs
                                            font-semibold
                                            px-3
                                            py-2
                                            min-w-[90px]
                                            text-center
                                        "
                                    >
                                        ₹{fees.toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </FormField>


                            {/* =================================================
                                FIND BUTTON
                            ================================================= */}

                            <button
                                onClick={handleFindColleges}
                                className="
                                    w-full
                                    py-3
                                    mt-2
                                    bg-[#493181]
                                    hover:bg-[#382468]
                                    text-white
                                    font-semibold
                                    text-sm
                                    transition
                                "
                            >
                                FIND ENGINEERING COLLEGES
                            </button>


                            {/* =================================================
                                RESET
                            ================================================= */}

                            <button
                                onClick={resetForm}
                                className="
                                    block
                                    mx-auto
                                    mt-4
                                    text-xs
                                    text-white/70
                                    hover:text-white
                                "
                            >
                                Reset Form
                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        RESULTS
                    ================================================= */}

                    {showResults && (

                        <div
                            id="results"
                            className="
                                mt-6
                                bg-white/20
                                backdrop-blur-md
                                border
                                border-white/20
                                p-5
                            "
                        >

                            <div className="text-center mb-5">

                                <h2 className="text-xl font-semibold text-white">
                                    Matching Colleges
                                </h2>

                                <p className="text-white/60 text-xs mt-1">
                                    {filteredColleges.length} colleges found
                                </p>

                            </div>


                            {filteredColleges.length === 0 ? (

                                <div className="text-center text-white/70 text-sm py-5">
                                    No colleges found. Try changing your filters.
                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {filteredColleges.map((college) => (

                                        <div
                                            key={college.id}
                                            className="
                                                bg-white/10
                                                border
                                                border-white/10
                                                p-4
                                            "
                                        >

                                            <div className="flex justify-between gap-3">

                                                <div>

                                                    <h3 className="text-sm font-semibold text-white">
                                                        {college.name}
                                                    </h3>

                                                    <p className="text-white/60 text-xs mt-1">
                                                        📍 {college.city}
                                                    </p>

                                                </div>

                                                <span className="text-yellow-300 text-xs">
                                                    ★ {college.rating}
                                                </span>

                                            </div>


                                            <div className="mt-3 text-xs text-white/70">

                                                <p>
                                                    🎓 {college.branch}
                                                </p>

                                                <p className="mt-1">
                                                    💰 ₹{college.fees.toLocaleString("en-IN")}
                                                </p>

                                                <p className="mt-1">
                                                    📍 {college.distance} km
                                                </p>

                                            </div>


                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/institution/${college.id}`
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    mt-3
                                                    py-2
                                                    bg-[#493181]
                                                    hover:bg-[#382468]
                                                    text-white
                                                    text-xs
                                                    font-semibold
                                                "
                                            >
                                                VIEW COLLEGE
                                            </button>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </main>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="relative z-10 text-center pb-6">

                <p className="text-white/50 text-xs">
                    © 2026 EduLocate · Smart Education Discovery
                </p>

            </footer>

        </div>
    );
}


// =============================================================
// FORM FIELD COMPONENT
// =============================================================

function FormField({ label, children }) {
    return (
        <div className="mb-4">

            <label className="block text-white text-xs font-medium mb-2">
                {label}
            </label>

            {children}

        </div>
    );
}


export default Engineeringcollegelist;