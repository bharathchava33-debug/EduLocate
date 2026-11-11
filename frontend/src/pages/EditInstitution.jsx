
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

const emptyInstitution = {
  name: "",
  education_level: "",
  location: "",
  district: "",
  state: "Telangana",
  phone: "",
  email: "",
  website: "",
  google_maps_url: "",
  latitude: "",
  longitude: "",
  rating: "",
  review_count: 0,
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

const inputStyle =
  "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500";

const sectionStyle =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access")
  );
}

function getHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

function getImageUrl(image) {
  if (image.image_url) return image.image_url;

  if (image.image) {
    if (image.image.startsWith("http")) {
      return image.image;
    }

    return `http://127.0.0.1:8000${image.image}`;
  }

  return "";
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={inputStyle}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={inputStyle}
      >
        {children}
      </select>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-4 text-lg font-semibold text-gray-800">
      {children}
    </h2>
  );
}

export default function EditInstitution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = (
    localStorage.getItem("role") || ""
  ).toLowerCase();

  const isAdmin = role === "admin";
  const isAuthority = role === "authority";

  const backPath = isAdmin
    ? "/admin/institutions"
    : "/authority/institutions";

  const [form, setForm] = useState(emptyInstitution);

  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImageUrls, setNewImageUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [interGroups, setInterGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programBranches, setProgramBranches] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [originalData, setOriginalData] = useState({
    interGroups: [],
    courses: [],
    programBranches: [],
  });

  // =====================================================
  // LOAD INSTITUTION AND RELATED DATA
  // =====================================================

  useEffect(() => {
    if (!isAdmin && !isAuthority) {
      navigate("/home");
      return;
    }

    loadInstitution();
  }, [id]);

  const loadInstitution = async () => {
    setLoading(true);
    setError("");

    try {
      const [institutionResponse, branchResponse] =
        await Promise.all([
          axios.get(`${API}/institutions/${id}/`, {
            headers: getHeaders(),
          }),
          axios.get(`${API}/branches/`, {
            headers: getHeaders(),
          }),
        ]);

      const data = institutionResponse.data;

      setForm({
        ...emptyInstitution,
        ...data,
      });

      const loadedImages = data.images || [];
      const loadedGroups = data.inter_groups || [];
      const loadedCourses = (data.courses || []).map((item) => ({
        ...item,
        branch_ids: (item.branches || []).map((branch) =>
          Number(branch.id)
        ),
      }));

      const loadedProgramBranches =
        data.program_branches || [];

      setImages(loadedImages);
      setInterGroups(loadedGroups);
      setCourses(loadedCourses);
      setProgramBranches(loadedProgramBranches);

      setOriginalData({
        interGroups: loadedGroups,
        courses: loadedCourses,
        programBranches: loadedProgramBranches,
      });

      const branchData = branchResponse.data;

      setBranches(
        Array.isArray(branchData)
          ? branchData
          : branchData.results || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Unable to load institution details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BASIC FORM HANDLERS
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "hostel_facility" && !checked
        ? { hostel_fee: "" }
        : {}),
    }));
  };

  // =====================================================
  // IMAGE HANDLERS
  // =====================================================

  const handleImageFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setNewImageFiles((previous) => [
      ...previous,
      ...selectedFiles,
    ]);

    // Allows selecting the same file again later.
    event.target.value = "";
  };

  const removeNewFile = (index) => {
    setNewImageFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const removeExistingImage = (imageId) => {
    setImages((previous) =>
      previous.filter((image) => image.id !== imageId)
    );

    setRemovedImageIds((previous) => [
      ...previous,
      imageId,
    ]);
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();

    if (!url) return;

    if (!/^https?:\/\/.+/i.test(url)) {
      setError("Please enter a valid image URL.");
      return;
    }

    setNewImageUrls((previous) => [
      ...previous,
      url,
    ]);

    setImageUrlInput("");
    setError("");
  };

  const removeNewImageUrl = (index) => {
    setNewImageUrls((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // INTER GROUP HANDLERS
  // =====================================================

  const addInterGroup = () => {
    setInterGroups((previous) => [
      ...previous,
      {
        group_name: "",
        group_fee: "",
        hostel_fee: "",
      },
    ]);
  };

  const updateInterGroup = (index, name, value) => {
    setInterGroups((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [name]: value }
          : item
      )
    );
  };

  const removeInterGroup = (index) => {
    setInterGroups((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // COURSE HANDLERS
  // =====================================================

  const addCourse = () => {
    setCourses((previous) => [
      ...previous,
      {
        course: "",
        course_fee: "",
        branch_ids: [],
      },
    ]);
  };

  const updateCourse = (index, name, value) => {
    setCourses((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [name]: value }
          : item
      )
    );
  };

  const toggleCourseBranch = (courseIndex, branchId) => {
    setCourses((previous) =>
      previous.map((course, index) => {
        if (index !== courseIndex) return course;

        const currentIds = course.branch_ids || [];

        const updatedIds = currentIds.includes(branchId)
          ? currentIds.filter((item) => item !== branchId)
          : [...currentIds, branchId];

        return {
          ...course,
          branch_ids: updatedIds,
        };
      })
    );
  };

  const removeCourse = (index) => {
    setCourses((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // PROGRAM BRANCH HANDLERS
  // =====================================================

  const addProgramBranch = () => {
    setProgramBranches((previous) => [
      ...previous,
      {
        program_type:
          form.education_level === "diploma"
            ? "diploma"
            : form.education_level === "degree"
              ? "degree"
              : "engineering",
        course: "",
        branch: "",
        cutoff_from: "",
        cutoff_to: "",
        branch_fee: "",
      },
    ]);
  };

  const updateProgramBranch = (index, name, value) => {
    setProgramBranches((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [name]: value }
          : item
      )
    );
  };

  const removeProgramBranch = (index) => {
    setProgramBranches((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // =====================================================
  // SAVE BASIC INSTITUTION DETAILS
  // =====================================================

  const saveBasicDetails = async () => {
    const payload = { ...form };

    const numericFields = [
      "latitude",
      "longitude",
      "rating",
      "hostel_fee",
      "class_fee",
    ];

    numericFields.forEach((field) => {
      if (payload[field] === "") {
        payload[field] = null;
      }
    });

    payload.review_count = Number(payload.review_count || 0);

    if (!payload.hostel_facility) {
      payload.hostel_fee = null;
    }

    await axios.patch(
      `${API}/institutions/${id}/`,
      payload,
      { headers: getHeaders() }
    );
  };

  // =====================================================
  // SAVE INTER GROUPS
  // =====================================================

  const saveInterGroups = async () => {
    const oldItems = originalData.interGroups;
    const currentIds = interGroups
      .filter((item) => item.id)
      .map((item) => item.id);

    for (const oldItem of oldItems) {
      if (!currentIds.includes(oldItem.id)) {
        await axios.delete(
          `${API}/inter-groups/${oldItem.id}/`,
          { headers: getHeaders() }
        );
      }
    }

    for (const item of interGroups) {
      const payload = {
        institution: Number(id),
        group_name: item.group_name,
        group_fee:
          item.group_fee === "" ? null : item.group_fee,
        hostel_fee:
          item.hostel_fee === "" ? null : item.hostel_fee,
      };

      if (item.id) {
        await axios.patch(
          `${API}/inter-groups/${item.id}/`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        await axios.post(
          `${API}/inter-groups/`,
          payload,
          { headers: getHeaders() }
        );
      }
    }
  };

  // =====================================================
  // SAVE COURSES
  // =====================================================

  const saveCourses = async () => {
    const oldItems = originalData.courses;
    const currentIds = courses
      .filter((item) => item.id)
      .map((item) => item.id);

    for (const oldItem of oldItems) {
      if (!currentIds.includes(oldItem.id)) {
        await axios.delete(
          `${API}/courses/${oldItem.id}/`,
          { headers: getHeaders() }
        );
      }
    }

    for (const item of courses) {
      const payload = {
        institution: Number(id),
        course: item.course,
        course_fee:
          item.course_fee === "" ? null : item.course_fee,
        branch_ids: item.branch_ids || [],
      };

      if (item.id) {
        await axios.patch(
          `${API}/courses/${item.id}/`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        await axios.post(
          `${API}/courses/`,
          payload,
          { headers: getHeaders() }
        );
      }
    }
  };

  // =====================================================
  // SAVE PROGRAM BRANCHES AND CUTOFFS
  // =====================================================

  const saveProgramBranches = async () => {
    const oldItems = originalData.programBranches;
    const currentIds = programBranches
      .filter((item) => item.id)
      .map((item) => item.id);

    for (const oldItem of oldItems) {
      if (!currentIds.includes(oldItem.id)) {
        await axios.delete(
          `${API}/program-branches/${oldItem.id}/`,
          { headers: getHeaders() }
        );
      }
    }

    for (const item of programBranches) {
      const payload = {
        institution: Number(id),
        program_type: item.program_type,
        course: item.course || "",
        branch: Number(item.branch),
        cutoff_from:
          item.cutoff_from === "" ? null : item.cutoff_from,
        cutoff_to:
          item.cutoff_to === "" ? null : item.cutoff_to,
        branch_fee:
          item.branch_fee === "" ? null : item.branch_fee,
      };

      if (!payload.branch || Number.isNaN(payload.branch)) {
        throw new Error(
          "Please select a branch for every program branch."
        );
      }

      if (item.id) {
        await axios.patch(
          `${API}/program-branches/${item.id}/`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        await axios.post(
          `${API}/program-branches/`,
          payload,
          { headers: getHeaders() }
        );
      }
    }
  };

  // =====================================================
  // SAVE IMAGES
  // =====================================================

  const saveImages = async () => {
    for (const imageId of removedImageIds) {
      await axios.delete(
        `${API}/institution-images/${imageId}/`,
        { headers: getHeaders() }
      );
    }

    for (const url of newImageUrls) {
      await axios.post(
        `${API}/institution-images/`,
        {
          institution: Number(id),
          image_url: url,
          is_primary: images.length === 0,
        },
        { headers: getHeaders() }
      );
    }

    for (let index = 0; index < newImageFiles.length; index++) {
      const formData = new FormData();

      formData.append("institution", id);
      formData.append("image", newImageFiles[index]);
      formData.append(
        "is_primary",
        images.length === 0 &&
          newImageUrls.length === 0 &&
          index === 0
      );

      await axios.post(
        `${API}/institution-images/`,
        formData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
    }
  };

  // =====================================================
  // SAVE ALL CHANGES
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Institution name is required.");
      }

      if (
        form.hostel_facility &&
        form.hostel_fee !== "" &&
        Number(form.hostel_fee) < 0
      ) {
        throw new Error("Hostel fee cannot be negative.");
      }

      await saveBasicDetails();

      if (form.education_level === "inter_college") {
        await saveInterGroups();
      }

      if (
        ["diploma", "engineering", "degree"].includes(
          form.education_level
        )
      ) {
        await saveCourses();
        await saveProgramBranches();
      }

      await saveImages();

      setMessage("Institution updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      await loadInstitution();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          JSON.stringify(err.response?.data) ||
          err.message ||
          "Unable to update institution."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">
          Loading institution details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Institution
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Update institution information and related details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg bg-green-100 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* BASIC DETAILS */}

          <section className={sectionStyle}>
            <SectionTitle>1. Basic Institution Details</SectionTitle>

            <div className="grid gap-4 md:grid-cols-3">

              <Field
                label="Institution Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              <SelectField
                label="Education Level"
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
              >
                <option value="">Select education level</option>
                <option value="school">School</option>
                <option value="inter_college">Intermediate</option>
                <option value="diploma">Diploma</option>
                <option value="engineering">Engineering</option>
                <option value="degree">Degree</option>
              </SelectField>

              <Field
                label="Location"
                name="location"
                value={form.location}
                onChange={handleChange}
              />

              <Field
                label="District"
                name="district"
                value={form.district}
                onChange={handleChange}
              />

              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />

              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />

              <Field
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
              />

              <Field
                label="Google Maps URL"
                name="google_maps_url"
                value={form.google_maps_url}
                onChange={handleChange}
              />

              <Field
                label="Latitude"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                type="number"
              />

              <Field
                label="Longitude"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                type="number"
              />

              <Field
                label="Rating"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                type="number"
              />

              <Field
                label="Review Count"
                name="review_count"
                value={form.review_count}
                onChange={handleChange}
                type="number"
              />

            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                rows="4"
                className={inputStyle}
              />
            </div>
          </section>

          {/* COLLEGE DETAILS */}

          {form.education_level !== "school" &&
            form.education_level !== "inter_college" && (
              <section className={sectionStyle}>
                <SectionTitle>2. College Details</SectionTitle>

                <div className="grid gap-4 md:grid-cols-3">

                  <SelectField
                    label="College Type"
                    name="college_type"
                    value={form.college_type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    <option value="government">Government</option>
                    <option value="aided">Aided</option>
                    <option value="private">Private</option>
                  </SelectField>

                  <SelectField
                    label="Institution Type"
                    name="institution_type"
                    value={form.institution_type}
                    onChange={handleChange}
                  >
                    <option value="">Select institution type</option>
                    <option value="autonomous">Autonomous</option>
                    <option value="jntu">JNTU</option>
                    <option value="university">University</option>
                    <option value="deemed_university">
                      Deemed University
                    </option>
                    <option value="other">Other</option>
                  </SelectField>

                  <Field
                    label="Affiliated To"
                    name="affiliated_to"
                    value={form.affiliated_to}
                    onChange={handleChange}
                  />

                  <Field
                    label="Approved By"
                    name="approved_by"
                    value={form.approved_by}
                    onChange={handleChange}
                  />

                </div>

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="autonomous"
                    checked={!!form.autonomous}
                    onChange={handleChange}
                  />
                  Autonomous Institution
                </label>
              </section>
            )}

          {/* SCHOOL DETAILS */}

          {form.education_level === "school" && (
            <section className={sectionStyle}>
              <SectionTitle>3. School Details</SectionTitle>

              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Classes"
                  name="school_classes"
                  value={form.school_classes}
                  onChange={handleChange}
                />

                <SelectField
                  label="Syllabus"
                  name="syllabus"
                  value={form.syllabus}
                  onChange={handleChange}
                >
                  <option value="">Select syllabus</option>
                  <option value="State">State</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                </SelectField>

                <Field
                  label="Class Fee"
                  name="class_fee"
                  value={form.class_fee}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            </section>
          )}

          {/* INTER GROUPS */}

          {form.education_level === "inter_college" && (
            <section className={sectionStyle}>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>3. Intermediate Groups</SectionTitle>

                <button
                  type="button"
                  onClick={addInterGroup}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                >
                  + Add Group
                </button>
              </div>

              {interGroups.map((item, index) => (
                <div
                  key={item.id || `group-${index}`}
                  className="mb-4 grid gap-3 rounded-lg border p-4 md:grid-cols-4"
                >
                  <Field
                    label="Group Name"
                    name="group_name"
                    value={item.group_name}
                    onChange={(e) =>
                      updateInterGroup(
                        index,
                        "group_name",
                        e.target.value
                      )
                    }
                  />

                  <Field
                    label="Group Fee"
                    name="group_fee"
                    value={item.group_fee}
                    onChange={(e) =>
                      updateInterGroup(
                        index,
                        "group_fee",
                        e.target.value
                      )
                    }
                    type="number"
                  />

                  <Field
                    label="Hostel Fee"
                    name="hostel_fee"
                    value={item.hostel_fee}
                    onChange={(e) =>
                      updateInterGroup(
                        index,
                        "hostel_fee",
                        e.target.value
                      )
                    }
                    type="number"
                  />

                  <button
                    type="button"
                    onClick={() => removeInterGroup(index)}
                    className="self-end rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {interGroups.length === 0 && (
                <p className="text-sm text-gray-500">
                  No intermediate groups added.
                </p>
              )}
            </section>
          )}

          {/* FACILITIES */}

          <section className={sectionStyle}>
            <SectionTitle>4. Facilities</SectionTitle>

            <div className="flex flex-wrap gap-8">

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hostel_facility"
                  checked={!!form.hostel_facility}
                  onChange={handleChange}
                />
                Hostel Facility
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="bus_facility"
                  checked={!!form.bus_facility}
                  onChange={handleChange}
                />
                Bus Facility
              </label>

              {form.education_level === "inter_college" && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="jee_main"
                    checked={!!form.jee_main}
                    onChange={handleChange}
                  />
                  JEE Main
                </label>
              )}

            </div>

            {form.hostel_facility && (
              <div className="mt-4 max-w-sm">
                <Field
                  label="Hostel Fee"
                  name="hostel_fee"
                  value={form.hostel_fee}
                  onChange={handleChange}
                  type="number"
                />
              </div>
            )}
          </section>

          {/* COURSES */}

          {["diploma", "engineering", "degree"].includes(
            form.education_level
          ) && (
            <section className={sectionStyle}>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>5. Courses</SectionTitle>

                <button
                  type="button"
                  onClick={addCourse}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                >
                  + Add Course
                </button>
              </div>

              {courses.map((item, index) => (
                <div
                  key={item.id || `course-${index}`}
                  className="mb-4 rounded-lg border p-4"
                >
                  <div className="mb-3 grid gap-3 md:grid-cols-3">

                    <Field
                      label="Course Name"
                      name="course"
                      value={item.course}
                      onChange={(e) =>
                        updateCourse(
                          index,
                          "course",
                          e.target.value
                        )
                      }
                    />

                    <Field
                      label="Course Fee"
                      name="course_fee"
                      value={item.course_fee}
                      onChange={(e) =>
                        updateCourse(
                          index,
                          "course_fee",
                          e.target.value
                        )
                      }
                      type="number"
                    />

                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="self-end rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
                    >
                      Remove Course
                    </button>

                  </div>

                  <p className="mb-2 text-sm font-medium">
                    Select Course Branches
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {branches.map((branch) => (
                      <label
                        key={branch.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(
                            item.branch_ids || []
                          ).includes(Number(branch.id))}
                          onChange={() =>
                            toggleCourseBranch(
                              index,
                              Number(branch.id)
                            )
                          }
                        />

                        {branch.name}
                      </label>
                    ))}
                  </div>

                  {branches.length === 0 && (
                    <p className="text-sm text-orange-600">
                      No branches are available. Ask Admin to add
                      branches first.
                    </p>
                  )}
                </div>
              ))}

              {courses.length === 0 && (
                <p className="text-sm text-gray-500">
                  No courses added.
                </p>
              )}
            </section>
          )}

          {/* PROGRAM BRANCHES AND CUTOFFS */}

          {["diploma", "engineering", "degree"].includes(
            form.education_level
          ) && (
            <section className={sectionStyle}>
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>6. Branches and Cutoff Details</SectionTitle>

                <button
                  type="button"
                  onClick={addProgramBranch}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                >
                  + Add Branch
                </button>
              </div>

              {programBranches.map((item, index) => (
                <div
                  key={item.id || `program-${index}`}
                  className="mb-4 rounded-lg border p-4"
                >
                  <div className="grid gap-3 md:grid-cols-3">

                    <SelectField
                      label="Program Type"
                      name="program_type"
                      value={item.program_type}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "program_type",
                          e.target.value
                        )
                      }
                    >
                      <option value="diploma">Diploma</option>
                      <option value="engineering">Engineering</option>
                      <option value="degree">Degree</option>
                    </SelectField>

                    <Field
                      label="Course"
                      name="course"
                      value={item.course}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "course",
                          e.target.value
                        )
                      }
                    />

                    <SelectField
                      label="Branch"
                      name="branch"
                      value={item.branch}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "branch",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select branch</option>

                      {branches.map((branch) => (
                        <option
                          key={branch.id}
                          value={branch.id}
                        >
                          {branch.name}
                        </option>
                      ))}
                    </SelectField>

                    <Field
                      label="Cutoff From"
                      name="cutoff_from"
                      value={item.cutoff_from}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "cutoff_from",
                          e.target.value
                        )
                      }
                      type="number"
                    />

                    <Field
                      label="Cutoff To"
                      name="cutoff_to"
                      value={item.cutoff_to}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "cutoff_to",
                          e.target.value
                        )
                      }
                      type="number"
                    />

                    <Field
                      label="Branch Fee"
                      name="branch_fee"
                      value={item.branch_fee}
                      onChange={(e) =>
                        updateProgramBranch(
                          index,
                          "branch_fee",
                          e.target.value
                        )
                      }
                      type="number"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={() => removeProgramBranch(index)}
                    className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
                  >
                    Remove Branch
                  </button>
                </div>
              ))}

              {programBranches.length === 0 && (
                <p className="text-sm text-gray-500">
                  No program branches or cutoff details added.
                </p>
              )}
            </section>
          )}

          {/* IMAGES */}

          <section className={sectionStyle}>
            <SectionTitle>7. Institution Images</SectionTitle>

            <p className="mb-3 text-sm text-gray-600">
              Existing images
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-lg border p-2"
                >
                  <img
                    src={getImageUrl(image)}
                    alt="Institution"
                    className="h-32 w-full rounded object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeExistingImage(image.id)
                    }
                    className="mt-2 w-full rounded bg-red-100 px-2 py-1 text-sm text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Add Multiple Image Files
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFiles}
                className="w-full rounded-lg border p-3"
              />

              {newImageFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newImageFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded bg-gray-100 p-2 text-sm"
                    >
                      <span className="truncate">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="ml-3 text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Add Official Website Image URL
              </label>

              <div className="flex flex-wrap gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) =>
                    setImageUrlInput(e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className={`${inputStyle} min-w-0 flex-1`}
                />

                <button
                  type="button"
                  onClick={addImageUrl}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Add URL
                </button>
              </div>

              {newImageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="mt-2 flex items-center justify-between rounded bg-gray-100 p-2 text-sm"
                >
                  <span className="truncate">{url}</span>

                  <button
                    type="button"
                    onClick={() => removeNewImageUrl(index)}
                    className="ml-3 text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SAVE */}

          <div className="flex flex-wrap justify-end gap-3 pb-8">

            <button
              type="button"
              onClick={() => navigate(backPath)}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-3 font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

