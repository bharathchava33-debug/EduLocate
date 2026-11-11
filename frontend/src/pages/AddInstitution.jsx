
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddInstitutionAnimations.css";

const API = "http://127.0.0.1:8000/api";

const initialFormData = {
  name: "",
  education_level: "",
  location: "",
  district: "",
  state: "Telangana",
  phone: "",
  email: "",
  website: "",
  latitude: "",
  longitude: "",
  rating: "",
  review_count: "",
  google_place_id: "",
  google_maps_url: "",
  description: "",
  college_type: "",
  autonomous: false,
  institution_type: "",
  affiliated_to: "",
  approved_by: "",
  bus_facility: false,
  hostel_facility: false,
  hostel_fee: "",
  school_classes: "",
  syllabus: "",
  class_fee: "",
  jee_main: false,
};

const emptyProgramBranch = (level) => ({
  program_type: level,
  course:
    level === "engineering"
      ? "B.Tech"
      : level === "degree"
        ? "Degree"
        : "Diploma",
  branch: "",
  cutoff_from: "",
  cutoff_to: "",
  branch_fee: "",
});

function AddInstitution() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [interGroups, setInterGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programBranches, setProgramBranches] = useState([]);

  const [websiteImages, setWebsiteImages] = useState([]);
  const [manualImages, setManualImages] = useState([]);
  const [previewImage, setPreviewImage] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteImageLoading, setWebsiteImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // BACK BUTTON
  const handleBack = () => {
    const role = (localStorage.getItem("role") || "")
      .toLowerCase()
      .trim();

    if (role === "admin") {
      navigate("/admin");
    } else if (
      ["authority", "institution_authority"].includes(role)
    ) {
      navigate("/authority");
    } else {
      navigate("/", { replace: true });
    }
  };

  // GENERAL FORM CHANGE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "hostel_facility" && !checked) {
      setFormData((previous) => ({
        ...previous,
        hostel_facility: false,
        hostel_fee: "",
      }));

      setInterGroups((previous) =>
        previous.map((item) => ({
          ...item,
          hostel_fee: "",
        }))
      );

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // EDUCATION LEVEL
  const handleEducationLevelChange = (e) => {
    const value = e.target.value;

    setFormData((previous) => ({
      ...previous,
      education_level: value,
      college_type: "",
      autonomous: false,
      institution_type: "",
      affiliated_to: "",
      approved_by: "",
      school_classes: "",
      syllabus: "",
      class_fee: "",
      jee_main: false,
    }));

    setCourses([]);
    setProgramBranches([]);
    setInterGroups([]);
    setWebsiteImages([]);
    setError("");
    setMessage("");
  };

  // COURSE OPTIONS
  const getCourseOptions = () => {
    switch (formData.education_level) {
      case "engineering":
        return ["B.Tech", "M.Tech", "MBA", "MCA", "Other"];

      case "degree":
        return [
          "B.Sc",
          "B.Com",
          "B.A.",
          "BBA",
          "BCA",
          "B.Sc (Honours)",
          "M.Sc",
          "M.Com",
          "M.A.",
          "Other",
        ];

      default:
        return [];
    }
  };

  // SEARCH INSTITUTION
  const fetchCollegeData = async () => {
    if (!formData.name.trim()) {
      setError("Please enter the institution name first.");
      return;
    }

    setSearchLoading(true);
    setError("");
    setMessage("");
    setSearchResults([]);
    setSelectedCollege(null);

    try {
      const response = await axios.post(
        `${API}/search-college/`,
        { name: formData.name.trim() },
        { timeout: 30000 }
      );

      const results = response.data.results || [];
      setSearchResults(results);

      setMessage(
        results.length
          ? `${results.length} matching institution(s) found. Select the correct institution.`
          : "No matching institution found. Enter details manually."
      );
    } catch (err) {
      console.error("Search error:", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          "Unable to search institutions."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // SELECT INSTITUTION
  const selectCollege = (college) => {
    setSelectedCollege(college);

    setFormData((previous) => ({
      ...previous,
      name: college.name || previous.name,
      location:
        college.location ||
        college.display_name ||
        previous.location,
      district: college.district || previous.district,
      state: college.state || previous.state,
      phone: college.phone || previous.phone,
      website: college.website || previous.website,
      latitude: college.latitude ?? previous.latitude,
      longitude: college.longitude ?? previous.longitude,
    }));

    setSearchResults([]);
    setMessage("Institution selected. Review the information.");
    setError("");
  };

  // WEBSITE VALIDATION
  const isValidWebsite = (url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  // FETCH WEBSITE DATA
  const fetchWebsiteData = async () => {
    const url = formData.website.trim();

    if (!url || !isValidWebsite(url)) {
      setError("Please enter a valid official website URL.");
      return;
    }

    setWebsiteLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/fetch-website-data/`,
        { url },
        { timeout: 60000 }
      );

      const data = response.data;
      const academic = data.academic_data || {};
      const images = data.images || [];

      setWebsiteImages(
        images.map((imageUrl, index) => ({
          url: imageUrl,
          selected: index === 0,
        }))
      );

      if (
        ["engineering", "degree"].includes(
          formData.education_level
        ) &&
        academic.courses?.length
      ) {
        setCourses(
          academic.courses.map((item) => ({
            course:
              typeof item === "string"
                ? item
                : item.name || "",
            course_fee: "",
            branches: [],
          }))
        );
      }

      if (
        ["diploma", "engineering", "degree"].includes(
          formData.education_level
        ) &&
        academic.branches?.length
      ) {
        setProgramBranches(
          academic.branches.map((item) => ({
            ...emptyProgramBranch(formData.education_level),
            branch:
              typeof item === "string"
                ? item
                : item.name || "",
          }))
        );
      }

      setFormData((previous) => ({
        ...previous,
        description:
          previous.description || data.description || "",
      }));

      setMessage(
        `Website information fetched. ${images.length} image(s) found.`
      );
    } catch (err) {
      console.error("Website error:", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          "Unable to fetch website information."
      );
    } finally {
      setWebsiteLoading(false);
    }
  };

  // FETCH WEBSITE IMAGES AGAIN
  const fetchWebsiteImagesAgain = async () => {
    const url = formData.website.trim();

    if (!url || !isValidWebsite(url)) {
      setError("Please enter a valid website URL.");
      return;
    }

    setWebsiteImageLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API}/fetch-website-images/`,
        { url },
        { timeout: 60000 }
      );

      const images = response.data.images || [];

      setWebsiteImages(
        images.map((imageUrl, index) => ({
          url: imageUrl,
          selected: index === 0,
        }))
      );

      setMessage(`${images.length} website image(s) found.`);
    } catch (err) {
      console.error("Image fetch error:", err.response?.data || err);

      setError(
        err.response?.data?.error ||
          "Unable to fetch website images."
      );
    } finally {
      setWebsiteImageLoading(false);
    }
  };

  // INTERMEDIATE GROUPS
  const addInterGroup = () => {
    setInterGroups((previous) => [
      ...previous,
      { group_name: "", group_fee: "", hostel_fee: "" },
    ]);
  };

  const updateInterGroup = (index, field, value) => {
    setInterGroups((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeInterGroup = (index) => {
    setInterGroups((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // COURSES
  const addCourse = () => {
    setCourses((previous) => [
      ...previous,
      { course: "", course_fee: "", branches: [] },
    ]);
  };

  const updateCourse = (index, field, value) => {
    setCourses((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeCourse = (index) => {
    setCourses((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const addCourseBranch = (courseIndex) => {
    setCourses((previous) =>
      previous.map((item, i) =>
        i === courseIndex
          ? { ...item, branches: [...item.branches, ""] }
          : item
      )
    );
  };

  const updateCourseBranch = (courseIndex, branchIndex, value) => {
    setCourses((previous) =>
      previous.map((item, i) =>
        i === courseIndex
          ? {
              ...item,
              branches: item.branches.map((branch, j) =>
                j === branchIndex ? value : branch
              ),
            }
          : item
      )
    );
  };

  const removeCourseBranch = (courseIndex, branchIndex) => {
    setCourses((previous) =>
      previous.map((item, i) =>
        i === courseIndex
          ? {
              ...item,
              branches: item.branches.filter(
                (_, j) => j !== branchIndex
              ),
            }
          : item
      )
    );
  };

  // PROGRAM BRANCHES
  const addProgramBranch = () => {
    setProgramBranches((previous) => [
      ...previous,
      emptyProgramBranch(formData.education_level),
    ]);
  };

  const updateProgramBranch = (index, field, value) => {
    setProgramBranches((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeProgramBranch = (index) => {
    setProgramBranches((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // WEBSITE IMAGE SELECTION
  const toggleWebsiteImage = (index) => {
    setWebsiteImages((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  // MULTIPLE MANUAL IMAGE UPLOAD
  // Selecting files again adds them instead of replacing earlier files.
  const handleManualImages = (e) => {
    const newFiles = Array.from(e.target.files || []);

    setManualImages((previous) => {
      const combined = [...previous];

      newFiles.forEach((file) => {
        const alreadyExists = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        );

        if (!alreadyExists) {
          combined.push(file);
        }
      });

      return combined;
    });

    e.target.value = "";
  };

  const removeManualImage = (index) => {
    setManualImages((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({ ...initialFormData });
    setInterGroups([]);
    setCourses([]);
    setProgramBranches([]);
    setWebsiteImages([]);
    setManualImages([]);
    setPreviewImage("");
    setSearchResults([]);
    setSelectedCollege(null);

    const fileInput = document.getElementById(
      "institution-manual-images"
    );

    if (fileInput) fileInput.value = "";
  };

  // SAVE INSTITUTION
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Institution name is required.");
      return;
    }

    if (!formData.education_level) {
      setError("Please select an education level.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Institution location is required.");
      return;
    }

    if (
      ["engineering", "degree"].includes(
        formData.education_level
      ) &&
      courses.some((item) => !item.course.trim())
    ) {
      setError("Enter all course names or remove empty courses.");
      return;
    }

    if (
      formData.education_level === "inter_college" &&
      interGroups.some((item) => !item.group_name.trim())
    ) {
      setError("Enter all intermediate group names.");
      return;
    }

    if (
      programBranches.some(
        (item) =>
          !item.branch.trim() ||
          !["diploma", "engineering", "degree"].includes(
            item.program_type
          )
      )
    ) {
      setError("Enter valid program branch details.");
      return;
    }

    const invalidCutoff = programBranches.some(
      (item) =>
        item.cutoff_from !== "" &&
        item.cutoff_to !== "" &&
        Number(item.cutoff_from) > Number(item.cutoff_to)
    );

    if (invalidCutoff) {
      setError("Cutoff From cannot be greater than Cutoff To.");
      return;
    }

    if (
      formData.website.trim() &&
      !isValidWebsite(formData.website.trim())
    ) {
      setError("Please enter a valid official website URL.");
      return;
    }

    if (
      formData.hostel_facility &&
      formData.hostel_fee !== "" &&
      Number(formData.hostel_fee) < 0
    ) {
      setError("Hostel fee cannot be negative.");
      return;
    }

    if (
      manualImages.some(
        (file) => !file.type.startsWith("image/")
      )
    ) {
      setError("Please select only image files.");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to save this institution?"
      )
    ) {
      return;
    }

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("access");

    if (!token) {
      setError("Your session expired. Please log in again.");
      navigate("/", { replace: true });
      return;
    }

    setSaving(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "hostel_fee" && !formData.hostel_facility) {
          return;
        }

        const nullableFields = [
          "latitude",
          "longitude",
          "rating",
          "hostel_fee",
          "class_fee",
          "review_count",
          "google_place_id",
        ];

        if (
          nullableFields.includes(key) &&
          (value === "" || value === null || value === undefined)
        ) {
          return;
        }

        form.append(key, value ?? "");
      });

      const validGroups = interGroups
        .filter((item) => item.group_name.trim())
        .map((item) => ({
          ...item,
          hostel_fee: formData.hostel_facility
            ? item.hostel_fee
            : "",
        }));

      const validCourses = courses
        .filter((item) => item.course.trim())
        .map((item) => ({
          ...item,
          branches: item.branches.filter((branch) =>
            branch.trim()
          ),
        }));

      const validProgramBranches = programBranches.filter(
        (item) => item.branch.trim()
      );

      form.append("inter_groups", JSON.stringify(validGroups));
      form.append("courses", JSON.stringify(validCourses));
      form.append(
        "program_branches",
        JSON.stringify(validProgramBranches)
      );

      const selectedImages = websiteImages
        .filter((item) => item.selected)
        .map((item) => item.url);

      form.append(
        "official_image_urls",
        JSON.stringify(selectedImages)
      );

      // APPEND EVERY MANUAL IMAGE
      manualImages.forEach((file) => {
        form.append("images", file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        `${API}/institutions/`,
        form,
        config
      );

      const role = (
        localStorage.getItem("role") || ""
      ).toLowerCase().trim();

      window.alert("Institution added successfully!");

      resetForm();

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (
        ["authority", "institution_authority"].includes(role)
      ) {
        navigate("/authority", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(
        "Save error:",
        err.response?.status,
        err.response?.data
      );

      const details = err.response?.data;
      let errorMessage =
        "Unable to save institution. Check the entered information.";

      if (typeof details === "string") {
        errorMessage = details;
      } else if (details && typeof details === "object") {
        errorMessage = Object.entries(details)
          .map(([field, value]) => {
            const description = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : String(value);

            return `${field}: ${description}`;
          })
          .join("\n");
      }

      setError(errorMessage);
      window.alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-3 py-5 sm:px-5">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 p-5 text-white shadow-lg sm:p-7">
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 rounded-lg border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
          >
            ← Back to Dashboard
          </button>

          <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
            EduLocate Institution Management
          </p>

          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            + Add Institution
          </h1>

          <p className="mt-2 text-sm text-blue-50">
            Add institution details, courses, facilities and admission information.
          </p>
        </div>

        {message && (
          <div role="status" className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="mb-3 whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* 1. SEARCH */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-indigo-800">
              1. Search Institution using OpenStreetMap
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter institution name"
                className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm"
              />

              <button
                type="button"
                onClick={fetchCollegeData}
                disabled={searchLoading}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {searchLoading ? "Searching..." : "Search Institution"}
              </button>
            </div>

            {searchResults.map((college, index) => (
              <div key={`${college.osm_type}-${college.osm_id}-${index}`} className="mt-3 rounded-lg border p-3">
                <h4 className="font-semibold">{college.name}</h4>
                <p className="mt-1 text-xs text-gray-600">
                  {college.display_name}
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  District: {college.district || "Not available"} |
                  State: {college.state || "Not available"}
                </p>
                <button
                  type="button"
                  onClick={() => selectCollege(college)}
                  className="mt-3 rounded-md bg-green-600 px-4 py-2 text-xs text-white"
                >
                  Select This Institution
                </button>
              </div>
            ))}

            {selectedCollege && (
              <p className="mt-3 rounded-md bg-green-50 p-2 text-xs text-green-700">
                Selected: {selectedCollege.name}
              </p>
            )}
          </section>

          {/* 2. BASIC INFORMATION */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-indigo-800">
              2. Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input label="Institution Name" name="name" value={formData.name} onChange={handleChange} required />

              <Select
                label="Education Level"
                name="education_level"
                value={formData.education_level}
                onChange={handleEducationLevelChange}
                required
                options={[
                  ["school", "School"],
                  ["inter_college", "Intermediate College"],
                  ["diploma", "Diploma College"],
                  ["engineering", "Engineering College"],
                  ["degree", "Degree College"],
                ]}
              />

              <Input label="Location / Full Address" name="location" value={formData.location} onChange={handleChange} required />
              <Input label="District" name="district" value={formData.district} onChange={handleChange} />
              <Input label="State" name="state" value={formData.state} onChange={handleChange} />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
              <Input label="Official Website" name="website" value={formData.website} onChange={handleChange} type="url" />
              <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} type="number" step="any" />
              <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} type="number" step="any" />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </section>

          {/* 3. INSTITUTION TYPE */}
          {["diploma", "engineering", "degree"].includes(formData.education_level) && (
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-indigo-800">
                3. Institution Type and Affiliation
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Select
                  label="College Type"
                  name="college_type"
                  value={formData.college_type}
                  onChange={handleChange}
                  options={[
                    ["government", "Government"],
                    ["aided", "Aided"],
                    ["private", "Private"],
                  ]}
                />

                {formData.college_type === "private" && (
                  <Select
                    label="Autonomous Status"
                    value={formData.autonomous ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        autonomous: e.target.value === "yes",
                      }))
                    }
                    options={[
                      ["yes", "Autonomous"],
                      ["no", "Non-Autonomous"],
                    ]}
                  />
                )}

                <Select
                  label="Institution Type"
                  name="institution_type"
                  value={formData.institution_type}
                  onChange={handleChange}
                  options={[
                    ["autonomous", "Autonomous"],
                    ["jntu", "JNTU"],
                    ["university", "University"],
                    ["deemed_university", "Deemed University"],
                    ["other", "Other"],
                  ]}
                />

                <Input label="Affiliated To" name="affiliated_to" value={formData.affiliated_to} onChange={handleChange} />
                <Input label="Approved By" name="approved_by" value={formData.approved_by} onChange={handleChange} />
              </div>
            </section>
          )}

          {/* 4. FACILITIES */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-bold text-indigo-800">
              4. Facilities
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Checkbox
                label="Bus Facility"
                name="bus_facility"
                checked={formData.bus_facility}
                onChange={handleChange}
              />

              <Checkbox
                label="Hostel Facility"
                name="hostel_facility"
                checked={formData.hostel_facility}
                onChange={handleChange}
              />

              {formData.hostel_facility && (
                <Input
                  label="Hostel Fee"
                  name="hostel_fee"
                  value={formData.hostel_fee}
                  onChange={handleChange}
                  type="number"
                  min="0"
                />
              )}
            </div>
          </section>

          {/* 5. SCHOOL */}
          {formData.education_level === "school" && (
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-indigo-800">
                5. School Information
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Classes Available" name="school_classes" value={formData.school_classes} onChange={handleChange} placeholder="Nursery to 10th" />

                <Select
                  label="Syllabus"
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleChange}
                  options={[
                    ["CBSE", "CBSE"],
                    ["STATE", "State Board"],
                    ["ICSE", "ICSE"],
                  ]}
                />

                <Input label="Class Fee" name="class_fee" value={formData.class_fee} onChange={handleChange} type="number" min="0" />
              </div>
            </section>
          )}

          {/* 5. INTERMEDIATE */}
          {formData.education_level === "inter_college" && (
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-indigo-800">
                  5. Intermediate Groups
                </h2>
                <button type="button" onClick={addInterGroup} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
                  + Add Group
                </button>
              </div>

              <Checkbox
                label="JEE Main Preparation Available"
                name="jee_main"
                checked={formData.jee_main}
                onChange={handleChange}
              />

              {interGroups.map((group, index) => (
                <div key={index} className="mb-3 mt-3 rounded-lg border p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input label="Group Name" value={group.group_name} onChange={(e) => updateInterGroup(index, "group_name", e.target.value)} placeholder="MPC / BiPC" />
                    <Input label="Group Fee" value={group.group_fee} onChange={(e) => updateInterGroup(index, "group_fee", e.target.value)} type="number" min="0" />

                    {formData.hostel_facility && (
                      <Input label="Group Hostel Fee" value={group.hostel_fee} onChange={(e) => updateInterGroup(index, "hostel_fee", e.target.value)} type="number" min="0" />
                    )}
                  </div>

                  <button type="button" onClick={() => removeInterGroup(index)} className="mt-2 text-xs text-red-600">
                    Remove Group
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* 5. COURSES */}
          {["engineering", "degree"].includes(formData.education_level) && (
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold text-indigo-800">
                  5. Courses and Specializations
                </h2>
                <button type="button" onClick={addCourse} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white">
                  + Add Course
                </button>
              </div>

              {courses.map((course, courseIndex) => (
                <div key={courseIndex} className="mb-3 rounded-lg border bg-gray-50 p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Course
                      </label>
                      <input
                        list={`course-options-${courseIndex}`}
                        value={course.course}
                        onChange={(e) => updateCourse(courseIndex, "course", e.target.value)}
                        className="h-9 w-full rounded-md border px-2.5 text-sm"
                      />
                      <datalist id={`course-options-${courseIndex}`}>
                        {getCourseOptions().map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>

                    <Input
                      label="Course Fee"
                      type="number"
                      min="0"
                      value={course.course_fee}
                      onChange={(e) => updateCourse(courseIndex, "course_fee", e.target.value)}
                    />

                    <div className="flex items-end">
                      <button type="button" onClick={() => removeCourse(courseIndex)} className="h-9 rounded-md border border-red-200 px-3 text-sm text-red-600">
                        Remove Course
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-2 flex justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Branches / Specializations
                      </h3>
                      <button type="button" onClick={() => addCourseBranch(courseIndex)} className="text-xs text-indigo-600">
                        + Add Branch
                      </button>
                    </div>

                    {course.branches.map((branch, branchIndex) => (
                      <div key={branchIndex} className="mb-2 flex gap-2">
                        <input
                          value={branch}
                          onChange={(e) => updateCourseBranch(courseIndex, branchIndex, e.target.value)}
                          className="h-9 min-w-0 flex-1 rounded-md border px-2.5 text-sm"
                          placeholder="CSE / ECE / Mathematics"
                        />
                        <button type="button" onClick={() => removeCourseBranch(courseIndex, branchIndex)} className="px-3 text-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* 6. BRANCH DETAILS */}
          {["engineering", "degree", "diploma"].includes(formData.education_level) && (
            <section className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold text-indigo-800">
                    6. Branch Details and Cutoff Range
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter branches and admission cutoff ranges.
                  </p>
                </div>

                <button type="button" onClick={addProgramBranch} className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">
                  + Add Branch Details
                </button>
              </div>

              {programBranches.map((branch, index) => (
                <div key={index} className="mb-3 rounded-lg border p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Select
                      label="Program Type"
                      value={branch.program_type}
                      onChange={(e) => updateProgramBranch(index, "program_type", e.target.value)}
                      options={[
                        ["diploma", "Diploma"],
                        ["engineering", "Engineering"],
                        ["degree", "Degree"],
                      ]}
                    />

                    <Input label="Course" value={branch.course} onChange={(e) => updateProgramBranch(index, "course", e.target.value)} />
                    <Input label="Branch Name" value={branch.branch} onChange={(e) => updateProgramBranch(index, "branch", e.target.value)} placeholder="CSE / ECE / EEE" />
                    <Input label="Cutoff From" value={branch.cutoff_from} onChange={(e) => updateProgramBranch(index, "cutoff_from", e.target.value)} type="number" min="0" />
                    <Input label="Cutoff To" value={branch.cutoff_to} onChange={(e) => updateProgramBranch(index, "cutoff_to", e.target.value)} type="number" min="0" />
                    <Input label="Branch Fee" value={branch.branch_fee} onChange={(e) => updateProgramBranch(index, "branch_fee", e.target.value)} type="number" min="0" />
                  </div>

                  <button type="button" onClick={() => removeProgramBranch(index)} className="mt-2 text-xs text-red-600">
                    Remove Branch Details
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* 7. WEBSITE DATA */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold text-indigo-800">
              7. Official Website Data
            </h2>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://college.ac.in"
                className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm"
              />

              <button
                type="button"
                onClick={fetchWebsiteData}
                disabled={websiteLoading}
                className="h-9 rounded-md bg-indigo-600 px-3 text-sm text-white disabled:opacity-60"
              >
                {websiteLoading ? "Fetching..." : "Fetch Website Data"}
              </button>
            </div>
          </section>

          {/* 8. WEBSITE IMAGES */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-indigo-800">
                8. Official Website Images
              </h2>

              <button
                type="button"
                onClick={fetchWebsiteImagesAgain}
                disabled={websiteImageLoading}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white"
              >
                {websiteImageLoading ? "Fetching..." : "Fetch Images Again"}
              </button>
            </div>

            {websiteImages.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                No website images found yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {websiteImages.map((item, index) => (
                  <div
                    key={`${item.url}-${index}`}
                    className={`rounded-lg border-2 p-2 ${
                      item.selected
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.url)}
                      className="block w-full"
                    >
                      <img
                        src={item.url}
                        alt={`Institution ${index + 1}`}
                        className="h-32 w-full rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </button>

                    <label className="mt-2 flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleWebsiteImage(index)}
                      />
                      Select Image
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 9. MANUAL MULTIPLE IMAGE UPLOAD */}
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 font-bold text-indigo-800">
              9. Manual Image Upload
            </h2>

            <p className="mb-3 text-xs text-gray-500">
              Select multiple images together or add more images later.
            </p>

            <input
              id="institution-manual-images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleManualImages}
              className="block w-full rounded-md border p-2 text-sm sm:w-auto"
            />

            {manualImages.length > 0 && (
              <>
                <p className="mt-3 text-sm font-semibold text-green-700">
                  {manualImages.length} image(s) selected
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {manualImages.map((file, index) => (
                    <div key={`${file.name}-${file.lastModified}-${index}`} className="overflow-hidden rounded-lg border p-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-28 w-full rounded object-cover"
                      />

                      <p className="mt-1 truncate text-xs text-gray-600">
                        {file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeManualImage(index)}
                        className="mt-2 w-full rounded bg-red-50 px-2 py-1 text-xs text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving Institution..." : "Save Institution"}
          </button>
        </form>

        {/* IMAGE PREVIEW */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setPreviewImage("")}
          >
            <div
              className="relative w-full max-w-4xl rounded-xl bg-white p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewImage("")}
                className="absolute right-5 top-5 rounded-full bg-black/70 px-3 py-1 text-xl text-white"
              >
                ×
              </button>

              <img
                src={previewImage}
                alt="Institution preview"
                className="max-h-[80vh] w-full rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// INPUT COMPONENT
function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  step,
  min,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="h-9 w-full rounded-md border border-gray-300 px-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

// SELECT COMPONENT
function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="h-9 w-full rounded-md border border-gray-300 bg-white px-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Select {label}</option>

        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

// CHECKBOX COMPONENT
function Checkbox({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="accent-indigo-600"
      />
      {label}
    </label>
  );
}

export default AddInstitution;
