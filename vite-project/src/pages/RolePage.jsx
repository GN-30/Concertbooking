import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ConcertCard from "../components/ConcertCard";
import { getByRole } from "../services/api";

export default function RolePage() {
  const { roleName } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getByRole(roleName);
        setList(res);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [roleName]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Role: {roleName}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {list.length ? (
          list.map((c) => (
            <ConcertCard key={c.id} concert={c} onAccept={() => {}} />
          ))
        ) : (
          <div className="text-gray-500">No items for this role yet.</div>
        )}
      </div>
    </div>
  );
}
