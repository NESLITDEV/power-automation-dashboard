import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UtilityUpload from "@/components/utility/UtilityUpload";
import ElectricityUsage from "./electricity";
import GasUsage from "./gas";
import WaterUsage from "./water";
import FuelBills from "./fuel";
import GenericExpense from "./generic";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components/keenicons";

const UtilityManagement = () => {
  const [selectedUtility, setSelectedUtility] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrFiles, setOcrFiles] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpenseType, setSelectedExpenseType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchExpenseTypes = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/Auth/Get-Role-Expense-Types`,
          {
            headers: {
              Authorization: `Bearer ${auth?.token}`,
            },
          }
        );

        // Find the user's role and its expense types
        const userRoleData = response.data.find((role) =>
          auth.roles.includes(role.roleName)
        );
        if (userRoleData) {
          setUserRole(userRoleData.roleName);
          setExpenseTypes(userRoleData.expenseTypes);
        }
      } catch (error) {
        console.error("Error fetching expense types:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchExpenseTypes();
    }
  }, [auth?.token, auth?.roles]);

  // Handle utility change
  const handleUtilityChange = (value) => {
    if (value === "add_new" && userRole === "Platinum") {
      // Handle adding new expense type
      console.log("Add new expense type");
      return;
    }

    const selectedType = expenseTypes.find(
      (type) => type.expenseTypeName === value
    );
    setSelectedExpenseType(selectedType);
    setSelectedUtility(selectedType?.expenseTypeName || "");
    setSelectedFile(null);
    setOcrFiles([]);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6">
          <div className="text-center">Loading expense types...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Utility Selection Dropdown */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Add Utility Expense
            </h2>
            {userRole && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account Type: {userRole}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedUtility} onValueChange={handleUtilityChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Utility" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem
                    key={type.expenseTypeId}
                    value={type.expenseTypeName}
                  >
                    {type.expenseTypeName}
                  </SelectItem>
                ))}
                {userRole === "Platinum" && (
                  <SelectItem
                    value="add_new"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <div className="flex items-center gap-2">
                      <KeenIcon icon="plus" className="h-4 w-4" />
                      Add Expense Type
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* OCR Upload Section */}
      <UtilityUpload
        title={selectedUtility || "Utility"}
        onFileSelect={handleFileSelect}
        ocrFiles={ocrFiles}
        setOcrFiles={setOcrFiles}
        disabled={!selectedUtility}
      />

      {/* Selected Utility Component */}
      <ElectricityUsage
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        expenseTypeId={selectedExpenseType?.expenseTypeId}
        expenseCategoryId={selectedExpenseType?.expenseCategoryId}
        unitOfMeasurement={selectedExpenseType?.unitOfMeasurement}
        disabled={!selectedUtility}
        expenseTypeName={selectedExpenseType?.expenseTypeName}
      />
    </div>
  );
};

export default UtilityManagement;
