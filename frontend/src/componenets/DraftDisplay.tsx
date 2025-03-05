import { ChangeEvent } from "preact/compat";
import { useState } from "preact/hooks";

interface Draft {
  id: number;
  name: string;
  createdAt: Date;
}

export default function DraftDisplay({ drafts }: { drafts: Draft[] }) {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target instanceof HTMLSelectElement) {
      const selectedId = event.target.value;
      const selected = drafts.find((draft) => draft.id === Number(selectedId));
      setSelectedDraft(selected ? selected : null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4">
        {" "}
        {/* Container for the dropdown */}
        <label
          htmlFor="draftSelect"
          className="block text-lg font-semibold mb-2"
        >
          Select a Draft:
        </label>{" "}
        {/* Label for accessibility */}
        <select
          id="draftSelect"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedDraft ? selectedDraft.id : ""} // Set the value based on selectedDraft
          onChange={handleSelectChange}
        >
          <option value="">Select a draft</option> {/* Default option */}
          {drafts.map((draft) => (
            <option key={draft.id} value={draft.id}>
              {draft.name} ({draft.createdAt.toLocaleString()}){" "}
            </option>
          ))}
        </select>
      </div>
      {selectedDraft && <DraftInfo draft={selectedDraft} />}
    </div>
  );
}

function DraftInfo({ draft }: { draft: Draft }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">{draft.name}</h3>
      <p className="text-gray-600">
        Created: {draft.createdAt.toLocaleString()}
      </p>
    </div>
  );
}
