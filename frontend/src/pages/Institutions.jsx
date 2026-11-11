
import { useEffect, useState } from "react";
import axios from "axios";

function Institutions() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/institutions/")
      .then((response) => {
        setInstitutions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching institutions:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2>Loading institutions...</h2>;
  }

  return (
    <div>
      <h1>EduLocate Institutions</h1>

      {institutions.length === 0 ? (
        <p>No institutions found.</p>
      ) : (
        institutions.map((institution) => (
          <div key={institution.id}>
            <h2>{institution.name}</h2>

            <p>Type: {institution.institution_type}</p>
            <p>Location: {institution.location}</p>
            <p>Courses: {institution.courses}</p>
            <p>Fees: ₹{institution.fees}</p>
            <p>Rating: {institution.rating}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Institutions;

