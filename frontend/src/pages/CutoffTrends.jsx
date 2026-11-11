
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  Filter,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

const API = "http://127.0.0.1:8000/api";

function CutoffTrends() {

  const navigate = useNavigate();

  const [allRecords, setAllRecords] = useState([]);
  const [records, setRecords] = useState([]);

  const [filters, setFilters] = useState({
    institution_id: "",
    program_type: "",
    branch_id: "",
    category: "",
    measurement_type: "rank",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD CUTOFF RECORDS
  const loadRecords = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await axios.get(
        `${API}/cutoff-trends/`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setAllRecords(data);

      setRecords(
        data.filter(
          (item) => item.measurement_type === "rank"
        )
      );

    } catch (err) {

      console.error("Cutoff API Error:", err);

      setError(
        "Unable to load cutoff records from the server."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // INSTITUTIONS
  const institutions = useMemo(() => {

    const unique = new Map();

    allRecords.forEach((item) => {

      unique.set(item.institution, {
        id: item.institution,
        name: item.institution_name,
      });

    });

    return [...unique.values()];

  }, [allRecords]);

  // BRANCHES
  const branches = useMemo(() => {

    const unique = new Map();

    allRecords
      .filter((item) =>
        !filters.institution_id ||
        String(item.institution) === filters.institution_id
      )
      .filter((item) =>
        !filters.program_type ||
        item.program_type === filters.program_type
      )
      .forEach((item) => {

        unique.set(item.branch, {
          id: item.branch,
          name: item.branch_name,
        });

      });

    return [...unique.values()];

  }, [
    allRecords,
    filters.institution_id,
    filters.program_type,
  ]);

  // CATEGORIES
  const categories = useMemo(() => {

    return [
      ...new Set(
        allRecords.map((item) => item.category)
      ),
    ];

  }, [allRecords]);

  // UPDATE FILTER
  const updateFilter = (key, value) => {

    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

  };

  // APPLY FILTERS
  const applyFilters = async () => {

    setLoading(true);
    setError("");

    try {

      const params = {};

      Object.entries(filters).forEach(([key, value]) => {

        if (value) {
          params[key] = value;
        }

      });

      const response = await axios.get(
        `${API}/cutoff-trends/`,
        { params }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setRecords(data);

    } catch (err) {

      console.error("Filter Error:", err);

      setError("Unable to filter cutoff records.");

    } finally {

      setLoading(false);

    }
  };

  // RESET FILTERS
  const resetFilters = () => {

    const defaultFilters = {
      institution_id: "",
      program_type: "",
      branch_id: "",
      category: "",
      measurement_type: "rank",
    };

    setFilters(defaultFilters);

    setRecords(
      allRecords.filter(
        (item) => item.measurement_type === "rank"
      )
    );

  };

  // CHART DATA
  const chartData = useMemo(() => {

    const grouped = {};

    records.forEach((item) => {

      const year = String(item.admission_year);

      if (!grouped[year]) {

        grouped[year] = {
          year,
        };

      }

      grouped[year][item.institution_name] =
        Number(item.cutoff_value);

    });

    return Object.values(grouped).sort(
      (a, b) => Number(a.year) - Number(b.year)
    );

  }, [records]);

  // INSTITUTION NAMES
  const institutionNames = useMemo(() => {

    return [
      ...new Set(
        records.map((item) => item.institution_name)
      ),
    ];

  }, [records]);

  // INPUT STYLE
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

  // CHART COLORS
  const colors = [
    "#2563eb",
    "#16a34a",
    "#9333ea",
    "#ea580c",
    "#0891b2",
  ];

  return (

    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>

            {/* BACK BUTTON */}

            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-900 transition duration-300"
            >
              <span className="text-lg">←</span>
              Back
            </button>

            <p className="text-sm font-semibold text-blue-600">
              EDULOCATE
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Cutoff Trends
            </h1>

            <p className="mt-2 text-gray-500">
              Explore historical admission cutoff records.
            </p>

          </div>

          <TrendingUp
            size={45}
            className="text-blue-600"
          />

        </div>


        {/* FILTER SECTION */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-2">

            <Filter className="text-blue-600" />

            <h2 className="text-lg font-bold">
              Filter Cutoff Records
            </h2>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* INSTITUTION */}

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Institution
              </label>

              <select
                className={inputClass}
                value={filters.institution_id}
                onChange={(e) =>
                  updateFilter("institution_id", e.target.value)
                }
              >

                <option value="">
                  All institutions
                </option>

                {institutions.map((item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>

                ))}

              </select>

            </div>


            {/* PROGRAM */}

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Education Level
              </label>

              <select
                className={inputClass}
                value={filters.program_type}
                onChange={(e) => {

                  updateFilter(
                    "program_type",
                    e.target.value
                  );

                  updateFilter("branch_id", "");

                }}
              >

                <option value="">
                  All programs
                </option>

                <option value="engineering">
                  Engineering
                </option>

                <option value="diploma">
                  Diploma
                </option>

                <option value="degree">
                  Degree
                </option>

              </select>

            </div>


            {/* BRANCH */}

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Branch
              </label>

              <select
                className={inputClass}
                value={filters.branch_id}
                onChange={(e) =>
                  updateFilter("branch_id", e.target.value)
                }
              >

                <option value="">
                  All branches
                </option>

                {branches.map((item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>

                ))}

              </select>

            </div>


            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                className={inputClass}
                value={filters.category}
                onChange={(e) =>
                  updateFilter("category", e.target.value)
                }
              >

                <option value="">
                  All categories
                </option>

                {categories.map((item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                ))}

              </select>

            </div>


            {/* MEASUREMENT */}

            <div>

              <label className="mb-2 block text-sm font-semibold">
                Measurement
              </label>

              <select
                className={inputClass}
                value={filters.measurement_type}
                onChange={(e) =>
                  updateFilter(
                    "measurement_type",
                    e.target.value
                  )
                }
              >

                <option value="rank">
                  Cutoff Rank
                </option>

                <option value="marks">
                  Cutoff Marks
                </option>

              </select>

            </div>

          </div>


          {/* FILTER BUTTONS */}

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              onClick={applyFilters}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Apply Filters
            </button>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg border px-6 py-3 hover:bg-gray-50 transition"
            >
              <RefreshCw size={17} />
              Reset
            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>

        )}


        {/* LOADING */}

        {loading ? (

          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <div className="mb-4 flex justify-center">

              <RefreshCw
                size={30}
                className="animate-spin text-blue-600"
              />

            </div>

            <p className="font-semibold text-gray-700">
              Loading cutoff data...
            </p>

          </div>

        ) : records.length === 0 ? (

          /* NO RECORDS */

          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <GraduationCap
              size={55}
              className="mx-auto mb-4 text-gray-400"
            />

            <h2 className="text-xl font-bold">
              No Cutoff Records Found
            </h2>

            <p className="mt-2 text-gray-500">
              Historical cutoff records have not been added
              for these filters yet.
            </p>

          </div>

        ) : (

          <>

            {/* STATISTICS */}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Total Records
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {records.length}
                </h2>

              </div>


              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Institutions
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {institutionNames.length}
                </h2>

              </div>


              <div className="rounded-xl bg-white p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                  Measurement
                </p>

                <h2 className="mt-2 text-2xl font-bold capitalize">
                  {filters.measurement_type}
                </h2>

              </div>

            </div>


            {/* CHART */}

            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="mb-6 text-xl font-bold">
                Admission Cutoff History
              </h2>

              <div className="h-80 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="year" />

                    <YAxis
                      reversed={
                        filters.measurement_type === "rank"
                      }
                      label={{
                        value:
                          filters.measurement_type === "rank"
                            ? "Cutoff Rank"
                            : "Cutoff Marks",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />

                    <Tooltip />

                    <Legend />

                    {institutionNames.map((name, index) => (

                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        connectNulls
                        dot={{ r: 5 }}
                      />

                    ))}

                  </LineChart>

                </ResponsiveContainer>

              </div>

              <p className="mt-3 text-xs text-gray-500">
                Rank and marks are displayed separately.
                For rank, a lower numerical value generally
                indicates a better cutoff rank.
              </p>

            </div>


            {/* HISTORICAL TABLE */}

            <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-xl font-bold">
                Historical Records
              </h2>

              <table className="w-full min-w-[750px] text-left text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3">Year</th>

                    <th className="p-3">Institution</th>

                    <th className="p-3">Program</th>

                    <th className="p-3">Branch</th>

                    <th className="p-3">Category</th>

                    <th className="p-3">Measurement</th>

                    <th className="p-3">Cutoff</th>

                  </tr>

                </thead>


                <tbody>

                  {records.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3">
                        {item.admission_year}
                      </td>

                      <td className="p-3">
                        {item.institution_name}
                      </td>

                      <td className="p-3 capitalize">
                        {item.program_type}
                      </td>

                      <td className="p-3">
                        {item.branch_name}
                      </td>

                      <td className="p-3">
                        {item.category}
                      </td>

                      <td className="p-3 capitalize">
                        {item.measurement_type}
                      </td>

                      <td className="p-3 font-bold">
                        {item.cutoff_value}
                      </td>

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

export default CutoffTrends;
