import React, { useState } from "react";
import DietPlannerCard from "../../Components/DietPlannerCard";

function DietPlanner() {
  const [showPlanner, setShowPlanner] = useState(false);
  const [showModal, setShowModal] = useState(true); // Show modal immediately

  const handleYes = () => {
    setShowPlanner(true);
    setShowModal(false);
  };

  const handleNo = () => {
    setShowPlanner(false);
    setShowModal(false);
  };

  return (
    <div className="relative bottom-40">
      {/* Diet Planner */}
      {showPlanner && <DietPlannerCard />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ⚠ AI Diet Planner Disclaimer
            </h2>

            {/* Body */}
            <p className="text-gray-600 leading-relaxed mb-6">
              This diet plan is generated using AI and may contain mistakes or
              inaccuracies. Always consult a qualified health professional
              before following any diet plan.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleNo}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No, Cancel
              </button>
              <button
                onClick={handleYes}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlanner;
