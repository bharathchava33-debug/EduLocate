
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const COMPARE_KEY = "edulocate_compare";
const MAX_COMPARE = 3;

function Compare() {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        loadInstitutions();
    }, []);

    const loadInstitutions = () => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(COMPARE_KEY) || "[]"
            );

            setInstitutions(
                Array.isArray(saved) ? saved.slice(0, MAX_COMPARE) : []
            );
        } catch (error) {
            console.error("Unable to load comparison:", error);
            setInstitutions([]);
        }
    };

    const removeInstitution = (id) => {
        const updated = institutions.filter(
            (institution) => institution.id !== id
        );

        setInstitutions(updated);
        localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
    };

    const clearComparison = () => {
        localStorage.removeItem(COMPARE_KEY);
        setInstitutions([]);
    };

    const getFee = (institution) => {
        const fees = [
            institution.annual_fee,
            institution.fee,
            institution.fees,
            institution.course_fee,
            institution.class_fee,
            institution.courses?.find(
                (item) => item.course_fee !== null &&
                    item.course_fee !== undefined
            )?.course_fee,
            institution.program_branches?.find(
                (item) => item.branch_fee !== null &&
                    item.branch_fee !== undefined
            )?.branch_fee,
            institution.inter_groups?.find(
                (item) => item.group_fee !== null &&
                    item.group_fee !== undefined
            )?.group_fee
        ];

        const fee = fees.find(
            (value) => value !== null &&
                value !== undefined &&
                value !== ""
        );

        if (fee === undefined) return "Not available";

        const amount = Number(fee);

        return Number.isFinite(amount)
            ? `₹${amount.toLocaleString("en-IN")}`
            : "Not available";
    };

    const getRating = (institution) => {
        const rating = Number(institution.rating);

        return Number.isFinite(rating) &&
            institution.rating !== null &&
            institution.rating !== ""
            ? `${rating.toFixed(1)} / 5`
            : "Not available";
    };

    const getEducationLevel = (institution) => {
        const types = {
            school: "School",
            inter_college: "Junior College",
            diploma: "Diploma College",
            engineering: "Engineering College",
            degree: "Degree College"
        };

        return types[institution.education_level] ||
            institution.education_level ||
            "Not available";
    };

    const getCourses = (institution) => {
        const courses = institution.courses || [];

        if (courses.length > 0) {
            return courses.map((item) => item.course)
                .filter(Boolean).join(", ");
        }

        const branches = institution.program_branches || [];

        if (branches.length > 0) {
            return branches.map((item) => item.branch)
                .filter(Boolean).join(", ");
        }

        return "Not available";
    };

    const getFacility = (value) => {
        if (value === true) return "Available";
        if (value === false) return "Not available";
        return "Not specified";
    };

    const comparisonRows = [
        {
            label: "Institution Type",
            getValue: getEducationLevel
        },
        {
            label: "Location",
            getValue: (item) =>
                item.location || item.district || item.state || "Not available"
        },
        {
            label: "Distance",
            getValue: (item) =>
                item.distance !== null && item.distance !== undefined
                    ? `${Number(item.distance).toFixed(1)} km`
                    : "Not available"
        },
        {
            label: "Rating",
            getValue: getRating
        },
        {
            label: "Review Count",
            getValue: (item) => item.review_count ?? "Not available"
        },
        {
            label: "Fees",
            getValue: getFee
        },
        {
            label: "Courses / Branches",
            getValue: getCourses
        },
        {
            label: "College Type",
            getValue: (item) => item.college_type || "Not applicable"
        },
        {
            label: "Hostel Facility",
            getValue: (item) => getFacility(item.hostel_facility)
        },
        {
            label: "Bus Facility",
            getValue: (item) => getFacility(item.bus_facility)
        },
        {
            label: "Website",
            getValue: (item) => item.website || "Not available"
        },
        {
            label: "Phone",
            getValue: (item) => item.phone || "Not available"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">

                <button
                    onClick={() => navigate("/search")}
                    className="mb-6 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                    ← Back to Search
                </button>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Compare Institutions
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Compare up to three institutions side by side.
                        </p>
                    </div>

                    {institutions.length > 0 && (
                        <button
                            onClick={clearComparison}
                            className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                        >
                            Clear Comparison
                        </button>
                    )}
                </div>

                {institutions.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                        <div className="mb-4 text-5xl">⚖️</div>

                        <h2 className="text-xl font-bold text-slate-800">
                            No Institutions Selected
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Go to Search Institutions and click Add to Compare.
                        </p>

                        <button
                            onClick={() => navigate("/search")}
                            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                        >
                            Find Institutions
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="mb-4 text-sm text-slate-600">
                            {institutions.length} of {MAX_COMPARE} institutions selected.
                        </p>

                        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
                            <table className="w-full min-w-[650px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="w-48 border-b p-4 text-sm font-bold text-slate-700">
                                            Details
                                        </th>

                                        {institutions.map((institution) => (
                                            <th
                                                key={institution.id}
                                                className="min-w-56 border-b p-4 align-top"
                                            >
                                                <h3 className="font-bold text-slate-900">
                                                    {institution.name}
                                                </h3>

                                                <button
                                                    onClick={() =>
                                                        removeInstitution(institution.id)
                                                    }
                                                    className="mt-3 text-xs font-semibold text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        navigate(`/institution/${institution.id}`)
                                                    }
                                                    className="ml-3 mt-3 text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    View Details
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {comparisonRows.map((row) => (
                                        <tr
                                            key={row.label}
                                            className="border-b last:border-b-0 hover:bg-slate-50"
                                        >
                                            <td className="bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                                                {row.label}
                                            </td>

                                            {institutions.map((institution) => (
                                                <td
                                                    key={institution.id}
                                                    className="p-4 text-sm text-slate-700"
                                                >
                                                    {row.getValue(institution)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Compare;
