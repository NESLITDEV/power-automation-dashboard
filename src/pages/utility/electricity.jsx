import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { useAuthContext } from "@/auth";

const ElectricityUsage = ({
  selectedFile,
  setSelectedFile,
  expenseTypeId,
  expenseCategoryId,
  unitOfMeasurement,
  disabled,
  expenseTypeName,
}) => {
  const [formData, setFormData] = useState({
    ratePerUnit: "",
    unitsConsumed: "",
    date: "",
    notes: "",
  });
  const { auth } = useAuthContext();

  const handleInputChange = (e) => {
    if (disabled) return;
    const { name, value } = e.target;
    // Only allow positive numbers for rate and units
    if ((name === "ratePerUnit" || name === "unitsConsumed") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!formData.ratePerUnit || !formData.unitsConsumed || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if we have the required IDs
    if (!auth?.id) {
      toast.error("User information not found. Please log in again.");
      return;
    }

    if (!expenseTypeId) {
      toast.error("Expense type not selected. Please select a utility type.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/user-expenses/Create-User-Expense`,
        {
          userId: auth.id,
          expenseTypeId: expenseTypeId,
          quantity: parseFloat(formData.unitsConsumed),
          ratePerUnit: parseFloat(formData.ratePerUnit),
          status: 1,
          expenseForDate: new Date(formData.date).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      console.log("API Response:", response.data);
      toast.success(
        `${expenseTypeName || "Utility"} usage recorded successfully`
      );
      setFormData({
        ratePerUnit: "",
        unitsConsumed: "",
        date: "",
        notes: "",
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to record ${expenseTypeName || "utility"} usage`
      );
    }
  };

  return (
    <div
      className={`grid gap-6 ${selectedFile?.url ? "lg:grid-cols-2" : "grid-cols-1"}`}
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate Per Unit</label>
              <Input
                type="number"
                name="ratePerUnit"
                value={formData.ratePerUnit}
                onChange={handleInputChange}
                placeholder="Enter rate per unit"
                required
                min="0"
                step="0.01"
                className="w-full"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Units Consumed</label>
              <Input
                type="number"
                name="unitsConsumed"
                value={formData.unitsConsumed}
                onChange={handleInputChange}
                placeholder="Enter units consumed"
                required
                min="0"
                step="0.01"
                className="w-full"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reading Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full"
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes"
                className="w-full"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  ratePerUnit: "",
                  unitsConsumed: "",
                  date: "",
                  notes: "",
                });
                setSelectedFile(null);
              }}
              disabled={disabled}
            >
              Clear
            </Button>
            <Button type="submit" disabled={disabled}>
              Save
            </Button>
          </div>
        </form>
      </Card>

      {/* Image Preview Section */}
      {selectedFile?.url && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Bill Preview: {selectedFile.name}
          </h2>
          <div className="relative h-[calc(100%-4rem)] min-h-[400px]">
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ElectricityUsage;
