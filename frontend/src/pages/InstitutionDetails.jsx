
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("access");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  return value;
};

const formatEducationLevel = (value) => {
  const levels = {
    school: "School",
    inter_college: "Intermediate College",
    diploma: "Diploma College",
    engineering: "Engineering College",
    degree: "Degree College",
  };

  return levels[value] || value || "Not provided";
};

const formatCollegeType = (value) => {
  const types = {
    government: "Government",
    aided: "Aided",
    private: "Private",
  };

  return types[value] || value || "Not provided";
};

const formatInstitutionType = (value) => {
  const types = {
    autonomous: "Autonomous",
    jntu: "JNTU",
    university: "University",
    deemed_university: "Deemed University",
    other: "Other",
  };

  return types[value] || value || "Not provided";
};

const formatFee = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2.5">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {formatValue(value)}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-5 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-800">
        {title}
      </h2>

      {children}
    </section>
  );
}

function imageSource(image) {
  if (image.image_url) {
    return image.image_url;
  }

  if (image.image) {
    if (image.image.startsWith("http")) {
      return image.image;
    }

    return `http://127.0.0.1:8000${image.image}`;
  }

  return "";
}

export default function InstitutionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = (
    localStorage.getItem("role") ||
    localStorage.getItem("user_role") ||
    ""
  ).toLowerCase();

  const isAdmin = role === "admin";
  const isAuthority = role === "authority";
  const canManage = isAdmin || isAuthority;

  // ROLE-BASED BACK NAVIGATION
  const backPath = isAdmin
    ? "/admin/institutions"
    : isAuthority
      ? "/authority/institutions"
      : "/search";

  const editPath = isAdmin
    ? `/admin/institutions/${id}/edit`
    : `/authority/institutions/${id}/edit`;

  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInstitution();
  }, [id]);

  const loadInstitution = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/institutions/${id}/`,
        {
          headers: getHeaders(),
        }
      );

      setInstitution(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load institution details."
      );
    } finally {
      setLoading(false);
    }
  };

  // DELETE INSTITUTION
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${institution.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    setError("");

    try {
      await axios.delete(
        `${API}/institutions/${id}/`,
        {
          headers: getHeaders(),
        }
      );

      alert("Institution deleted successfully.");

      navigate(backPath, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete institution."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-base font-medium text-gray-600">
          Loading institution details...
        </p>
      </div>
    );
  }

  if (error && !institution) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <p className="mb-4 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => navigate(backPath, { replace: true })}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!institution) return null;

  const level = institution.education_level;

  const isSchool = level === "school";
  const isInter = level === "inter_college";

  const isCollege =
    level === "diploma" ||
    level === "engineering" ||
    level === "degree";

  const images = institution.images || [];
  const groups = institution.inter_groups || [];
  const courses = institution.courses || [];
  const programBranches = institution.program_branches || [];

  // ADDRESS-BASED GOOGLE MAP
  const institutionAddress = [
    institution.location,
    institution.district,
    institution.state,
    "India",
  ]
    .filter(Boolean)
    .join(", ");

  const mapUrl = institutionAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(institutionAddress)}`
    : institution.google_maps_url;

  const embeddedMapUrl = institutionAddress
    ? `https://maps.google.com/maps?q=${encodeURIComponent(institutionAddress)}&output=embed`
    : null;

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-5 sm:px-4">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">

          <button
            onClick={() => navigate(backPath)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Search
          </button>

          {canManage && (
            <div className="flex flex-wrap gap-2">

              <button
                onClick={() => navigate(editPath)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Institution
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Institution"}
              </button>

            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* INSTITUTION HEADER */}

        <div className="rounded-xl bg-white p-5 shadow-sm">

          <h1 className="text-2xl font-bold text-gray-900">
            {institution.name}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {formatValue(institution.location)}
            {institution.district
              ? `, ${institution.district}`
              : ""}
            {institution.state
              ? `, ${institution.state}`
              : ""}
          </p>

          <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {formatEducationLevel(level)}
          </span>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mt-5 grid gap-3 md:grid-cols-3">

          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">
              Rating
            </p>

            <h2 className="mt-2 flex items-center gap-1 text-base font-bold text-gray-800">
              <span className="text-sm">⭐</span>
              {institution.rating || "Not provided"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {institution.review_count || 0} reviews
            </p>
          </div>

          {!isSchool && !isInter && (
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-gray-500">
                College Type
              </p>

              <h2 className="mt-2 text-base font-bold text-gray-800">
                {formatCollegeType(institution.college_type)}
              </h2>
            </div>
          )}

          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs text-gray-500">
              Hostel Facility
            </p>

            <h2 className="mt-2 text-base font-bold text-gray-800">
              {institution.hostel_facility
                ? "Available"
                : "Not Available"}
            </h2>
          </div>

        </div>

        {/* INSTITUTION IMAGES */}

        <Section title={`Institution Images (${images.length})`}>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">

              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >

                  {imageSource(image) ? (
                    <img
                      src={imageSource(image)}
                      alt={institution.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-100 text-xs text-gray-400">
                      Image unavailable
                    </div>
                  )}

                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-gray-800">
                      {institution.name}
                    </p>

                    {image.is_primary && (
                      <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Primary Image
                      </span>
                    )}
                  </div>

                </div>
              ))}

            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No institution images available.
            </p>
          )}

        </Section>

        {/* BASIC INFORMATION */}

        <Section title="Basic Institution Information">

          <div className="grid gap-3 md:grid-cols-2">

            <Detail label="Institution Name" value={institution.name} />

            <Detail
              label="Education Level"
              value={formatEducationLevel(level)}
            />

            {!isSchool && !isInter && (
              <>
                <Detail
                  label="College Type"
                  value={formatCollegeType(institution.college_type)}
                />

                <Detail
                  label="Institution Type"
                  value={formatInstitutionType(institution.institution_type)}
                />

                <Detail
                  label="Autonomous"
                  value={institution.autonomous ? "Yes" : "No"}
                />

                <Detail
                  label="Affiliated To"
                  value={institution.affiliated_to}
                />

                <Detail
                  label="Approved By"
                  value={institution.approved_by}
                />
              </>
            )}

            <Detail label="Location" value={institution.location} />

            <Detail label="District" value={institution.district} />

            <Detail label="State" value={institution.state} />

            <Detail label="Phone" value={institution.phone} />

            <Detail label="Email" value={institution.email} />

            <Detail label="Website" value={institution.website} />

            <Detail
              label="Google Place ID"
              value={institution.google_place_id}
            />

            <Detail label="Latitude" value={institution.latitude} />

            <Detail label="Longitude" value={institution.longitude} />

            <Detail label="Rating" value={institution.rating} />

            <Detail
              label="Review Count"
              value={institution.review_count}
            />

          </div>

          <div className="mt-3">
            <Detail
              label="Description"
              value={institution.description}
            />
          </div>

        </Section>

        {/* SCHOOL INFORMATION */}

        {isSchool && (
          <Section title="School Information">

            <div className="grid gap-3 md:grid-cols-2">

              <Detail
                label="School Classes"
                value={institution.school_classes}
              />

              <Detail
                label="Syllabus"
                value={institution.syllabus}
              />

              <Detail
                label="Class Fee"
                value={formatFee(institution.class_fee)}
              />

            </div>

          </Section>
        )}

        {/* INTERMEDIATE INFORMATION */}

        {isInter && (
          <Section title="Intermediate Information">

            <div className="mb-4 grid gap-3 md:grid-cols-2">

              <Detail
                label="JEE Main"
                value={institution.jee_main ? "Yes" : "No"}
              />

            </div>

            <h3 className="mb-3 text-base font-semibold">
              Groups and Fees
            </h3>

            {groups.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">

                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-lg border p-3"
                  >

                    <h4 className="mb-2 text-sm font-bold">
                      {group.group_name}
                    </h4>

                    <Detail
                      label="Group Fee"
                      value={formatFee(group.group_fee)}
                    />

                    <div className="mt-2">
                      <Detail
                        label="Hostel Fee"
                        value={formatFee(group.hostel_fee)}
                      />
                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No intermediate groups added.
              </p>
            )}

          </Section>
        )}

        {/* FACILITIES AND FEES */}

        <Section title="Facilities and Fees">

          <div className="grid gap-3 md:grid-cols-2">

            <Detail
              label="Hostel Facility"
              value={
                institution.hostel_facility
                  ? "Available"
                  : "Not Available"
              }
            />

            {institution.hostel_facility && (
              <Detail
                label="Hostel Fee"
                value={formatFee(institution.hostel_fee)}
              />
            )}

            <Detail
              label="Bus Facility"
              value={
                institution.bus_facility
                  ? "Available"
                  : "Not Available"
              }
            />

            {!isSchool && !isInter && (
              <Detail
                label="College Type"
                value={formatCollegeType(institution.college_type)}
              />
            )}

          </div>

        </Section>

        {/* COURSES */}

        {isCollege && (
          <Section title="Courses Offered">

            {courses.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">

                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-lg border p-3"
                  >

                    <h3 className="text-base font-bold text-gray-800">
                      {course.course}
                    </h3>

                    <p className="mt-2 text-xs text-gray-600">
                      Course Fee: {formatFee(course.course_fee)}
                    </p>

                    <h4 className="mt-3 text-sm font-semibold">
                      Branches
                    </h4>

                    {course.branches?.length > 0 ? (
                      <ul className="mt-2 list-inside list-disc text-sm text-gray-700">

                        {course.branches.map((branch) => (
                          <li key={branch.id}>
                            {branch.name}
                          </li>
                        ))}

                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">
                        No branches added.
                      </p>
                    )}

                  </div>
                ))}

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No courses added.
              </p>
            )}

          </Section>
        )}

        {/* BRANCHES AND CUTOFF DETAILS */}

        {isCollege && (
          <Section title="Branches and Cutoff Details">

            {programBranches.length > 0 ? (
              <div className="overflow-x-auto">

                <table className="w-full border-collapse text-left text-sm">

                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Program</th>
                      <th className="border p-2">Course</th>
                      <th className="border p-2">Branch</th>
                      <th className="border p-2">Cutoff From</th>
                      <th className="border p-2">Cutoff To</th>
                      <th className="border p-2">Branch Fee</th>
                    </tr>
                  </thead>

                  <tbody>

                    {programBranches.map((item) => (
                      <tr key={item.id}>

                        <td className="border p-2">
                          {formatEducationLevel(item.program_type)}
                        </td>

                        <td className="border p-2">
                          {formatValue(item.course)}
                        </td>

                        <td className="border p-2">
                          {item.branch_name ||
                            item.branch?.name ||
                            "Not provided"}
                        </td>

                        <td className="border p-2">
                          {formatValue(item.cutoff_from)}
                        </td>

                        <td className="border p-2">
                          {formatValue(item.cutoff_to)}
                        </td>

                        <td className="border p-2">
                          {formatFee(item.branch_fee)}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No branch or cutoff details added.
              </p>
            )}

          </Section>
        )}

        {/* ADDRESS-BASED GOOGLE MAP */}

        {institutionAddress && (
          <Section title="Institution Location">

            <div className="overflow-hidden rounded-lg border border-gray-200">

              <iframe
                title={`${institution.name} Location`}
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={embeddedMapUrl}
              />

            </div>

            <p className="mt-3 text-xs text-gray-600">
              {institutionAddress}
            </p>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open in Google Maps
            </a>

          </Section>
        )}

        {/* BOTTOM BACK BUTTON */}

        <div className="mt-5 pb-6">

          <button
            onClick={() => navigate(backPath)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Search
          </button>

        </div>

      </div>
    </div>
  );
}
