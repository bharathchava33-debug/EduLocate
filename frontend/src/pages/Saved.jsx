
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SAVED_KEY = "edulocate_saved";

function Saved() {
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        loadSaved();
    }, []);

    const loadSaved = () => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(SAVED_KEY) || "[]"
            );

            setInstitutions(Array.isArray(saved) ? saved : []);
        } catch (error) {
            console.error(error);
            setInstitutions([]);
        }
    };

    const removeInstitution = (id) => {
        const updated = institutions.filter(
            (item) => item.id !== id
        );

        localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
        setInstitutions(updated);
    };

    const clearSaved = () => {
        localStorage.removeItem(SAVED_KEY);
        setInstitutions([]);
    };

    const getImage = (institution) => {
        const images =
            institution.images ||
            institution.institution_images ||
            [];

        if (Array.isArray(images) && images.length > 0) {
            const first = images[0];

            if (typeof first === "string") return first;

            return first.image_url || first.image || first.url || "";
        }

        return institution.image_url || institution.image || "";
    };

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
                            Saved Institutions
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Your favourite educational institutions.
                        </p>
                    </div>

                    {institutions.length > 0 && (
                        <button
                            onClick={clearSaved}
                            className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {institutions.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                        <div className="mb-4 text-5xl">💗</div>
                        <h2 className="text-xl font-bold text-slate-800">
                            No Saved Institutions
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Click the heart button on an institution card
                            to save it here.
                        </p>
                        <button
                            onClick={() => navigate("/search")}
                            className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                        >
                            Find Institutions
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {institutions.map((institution) => {
                            const image = getImage(institution);

                            return (
                                <div
                                    key={institution.id}
                                    className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={institution.name}
                                            className="h-44 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-44 items-center justify-center bg-blue-100 text-5xl">
                                            🎓
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <h2 className="text-lg font-bold text-slate-900">
                                            {institution.name}
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            📍 {institution.location ||
                                                institution.district ||
                                                institution.state ||
                                                "Location not available"}
                                        </p>

                                        <p className="mt-2 text-sm text-yellow-600">
                                            ★ {institution.rating !== null &&
                                                institution.rating !== undefined &&
                                                institution.rating !== ""
                                                ? Number(institution.rating).toFixed(1)
                                                : "Not rated"}
                                        </p>

                                        <div className="mt-5 flex gap-3">
                                            <button
                                                onClick={() =>
                                                    navigate(`/institution/${institution.id}`)
                                                }
                                                className="flex-1 rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800"
                                            >
                                                View Details
                                            </button>

                                            <button
                                                onClick={() =>
                                                    removeInstitution(institution.id)
                                                }
                                                className="rounded-lg border border-red-200 px-4 text-red-600 hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Saved;
