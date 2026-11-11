
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Calculator,
  GraduationCap,
  IndianRupee,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const initialValues = {
  institution_id: "",
  program_branch_id: "",
  course_offering_id: "",
  inter_group_id: "",
  transport_fee: "0",
  books_fee: "0",
  other_fee: "0",
  years: "1",
};

function CostCalculator() {
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [educationLevel, setEducationLevel] = useState("");
  const [form, setForm] = useState(initialValues);

  const [options, setOptions] = useState({
    branches: [],
    courses: [],
    groups: [],
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstitutions();
  }, [educationLevel]);

  const loadInstitutions = async () => {
    try {
      const params = educationLevel
        ? { education_level: educationLevel }
        : {};

      const response = await axios.get(
        `${API}/cost-calculator/institutions/`,
        { params }
      );

      setInstitutions(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );

      setError("");
    } catch (err) {
      setError("Unable to load institutions.");
    }
  };

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setResult(null);
  };

  const selectInstitution = async (id) => {
    setForm({
      ...initialValues,
      institution_id: id,
    });

    setOptions({
      branches: [],
      courses: [],
      groups: [],
    });

    setResult(null);
    setError("");

    if (!id) return;

    try {
      const response = await axios.get(
        `${API}/institutions/${id}/`
      );

      const institution = response.data;

      setOptions({
        branches: institution.program_branches || [],
        courses: institution.courses || [],
        groups: institution.inter_groups || [],
      });
    } catch (err) {
      console.warn(
        "Institution details unavailable:",
        err
      );
    }
  };

  const calculate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        ...form,
        institution_id: Number(form.institution_id),
        years: Number(form.years),
        transport_fee: Number(form.transport_fee),
        books_fee: Number(form.books_fee),
        other_fee: Number(form.other_fee),
      };

      if (form.program_branch_id) {
        payload.program_branch_id = Number(
          form.program_branch_id
        );
      } else {
        delete payload.program_branch_id;
      }

      if (form.course_offering_id) {
        payload.course_offering_id = Number(
          form.course_offering_id
        );
      } else {
        delete payload.course_offering_id;
      }

      if (form.inter_group_id) {
        payload.inter_group_id = Number(
          form.inter_group_id
        );
      } else {
        delete payload.inter_group_id;
      }

      const response = await axios.post(
        `${API}/cost-calculator/estimate/`,
        payload
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Calculation failed. Please check your inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(initialValues);
    setResult(null);
    setError("");

    setOptions({
      branches: [],
      courses: [],
      groups: [],
    });
  };

  const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow transition duration-300 hover:bg-blue-900"
        >
          <span className="text-lg">←</span>
          Back
        </button>

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              EDULOCATE
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Education Cost Calculator
            </h1>

            <p className="mt-2 text-gray-500">
              Estimate your educational expenses.
            </p>
          </div>

          <Calculator size={42} className="text-blue-600" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* CALCULATOR FORM */}
          <form
            onSubmit={calculate}
            className="space-y-5 rounded-2xl bg-white p-6 shadow-sm lg:col-span-2"
          >
            <h2 className="text-xl font-bold">
              Enter your details
            </h2>

            {/* EDUCATION LEVEL */}
            <div>
              <label className="mb-2 block font-semibold">
                Education Level
              </label>

              <select
                className={inputClass}
                value={educationLevel}
                onChange={(e) => {
                  setEducationLevel(e.target.value);
                  reset();
                }}
                required
              >
                <option value="">All education levels</option>
                <option value="school">School</option>
                <option value="inter_college">Intermediate</option>
                <option value="diploma">Diploma</option>
                <option value="engineering">Engineering</option>
                <option value="degree">Degree</option>
              </select>
            </div>

            {/* INSTITUTION */}
            <div>
              <label className="mb-2 block font-semibold">
                Select Institution
              </label>

              <select
                className={inputClass}
                value={form.institution_id}
                onChange={(e) =>
                  selectInstitution(e.target.value)
                }
                required
              >
                <option value="">Choose institution</option>

                {institutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* INTERMEDIATE GROUP */}
            {options.groups.length > 0 && (
              <div>
                <label className="mb-2 block font-semibold">
                  Intermediate Group
                </label>

                <select
                  className={inputClass}
                  value={form.inter_group_id}
                  onChange={(e) =>
                    update("inter_group_id", e.target.value)
                  }
                >
                  <option value="">Select group</option>

                  {options.groups.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.group_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* COURSE */}
            {options.courses.length > 0 && (
              <div>
                <label className="mb-2 block font-semibold">
                  Select Course
                </label>

                <select
                  className={inputClass}
                  value={form.course_offering_id}
                  onChange={(e) =>
                    update("course_offering_id", e.target.value)
                  }
                >
                  <option value="">Select course</option>

                  {options.courses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.course}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* BRANCH */}
            {options.branches.length > 0 && (
              <div>
                <label className="mb-2 block font-semibold">
                  Select Branch
                </label>

                <select
                  className={inputClass}
                  value={form.program_branch_id}
                  onChange={(e) =>
                    update("program_branch_id", e.target.value)
                  }
                >
                  <option value="">Select branch</option>

                  {options.branches.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.branch_name || item.branch?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ADDITIONAL FEES */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["transport_fee", "Transport Fee"],
                ["books_fee", "Books and Materials"],
                ["other_fee", "Other Expenses"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block font-semibold">
                    {label} (₹ / year)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) =>
                      update(field, e.target.value)
                    }
                  />
                </div>
              ))}

              {/* COURSE DURATION */}
              <div>
                <label className="mb-2 block font-semibold">
                  Course Duration (Years)
                </label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  className={inputClass}
                  value={form.years}
                  onChange={(e) =>
                    update("years", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || !form.institution_id}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Calculator size={20} />
                )}

                Calculate Cost
              </button>

              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-2 rounded-lg border px-5 py-3 transition hover:bg-gray-100"
              >
                <RotateCcw size={18} />
                Reset
              </button>
            </div>
          </form>

          {/* COST SUMMARY */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <IndianRupee
                className="text-blue-600"
                size={28}
              />

              <h2 className="text-xl font-bold">
                Cost Summary
              </h2>
            </div>

            {!result ? (
            <div className="py-12 text-center text-blue-600">
               <GraduationCap
                    size={55}
                    className="mx-auto mb-4 text-blue-600"
                />

             <p className="font-semibold text-blue-700">
                Enter your details to calculate your cost.
             </p>
            </div>
            ) : (
              <div className="space-y-4">
                <p className="font-bold text-gray-800">
                  {result.institution}
                </p>

                <p className="text-sm text-gray-500">
                  Fee source: {result.fee_source}
                </p>

                {Object.entries(result.breakdown || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-3 border-b pb-3 text-sm"
                    >
                      <span className="capitalize text-gray-600">
                        {key.replaceAll("_", " ")}
                      </span>

                      <span className="font-semibold">
                        {money(value)}
                      </span>
                    </div>
                  )
                )}

                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    Estimated yearly cost
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-blue-800">
                    {money(result.annual_total)}
                  </h3>
                </div>

                <div className="rounded-xl bg-blue-600 p-4 text-white">
                  <p className="text-sm">
                    Estimated total course cost ({result.years} years)
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">
                    {money(result.course_total)}
                  </h3>
                </div>

                <p className="text-xs text-gray-400">
                  This is an estimate based on the available fee
                  records. Actual expenses may change.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostCalculator;
