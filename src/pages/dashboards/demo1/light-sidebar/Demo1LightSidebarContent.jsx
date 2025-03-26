import { useState, useEffect } from "react";
import { UtilityDistribution } from "./blocks";
import { KeenIcon } from "@/components/keenicons";
import axios from "axios";
import { useAuthContext } from "@/auth";

const Demo1LightSidebarContent = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses
        const expensesResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/user-expenses/${auth.id}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        setExpenses(expensesResponse.data);

        // Get unique expense types from the expenses
        const uniqueTypes = [
          ...new Set(
            expensesResponse.data.map((expense) => expense.expenseTypeName)
          ),
        ];
        setExpenseTypes(uniqueTypes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.id) {
      fetchData();
    }
  }, [auth?.id, auth?.token]);

  // Calculate statistics for each utility type
  const getUtilityStats = (expenseTypeName) => {
    const utilityExpenses = expenses.filter(
      (expense) => expense.expenseTypeName === expenseTypeName
    );

    if (utilityExpenses.length === 0) return { quantity: 0, change: 0 };

    const totalQuantity = utilityExpenses.reduce(
      (sum, expense) => sum + expense.quantity,
      0
    );

    // Calculate change percentage (using the last two entries)
    const sortedExpenses = [...utilityExpenses].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    let change = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].quantity;
      const previous = sortedExpenses[1].quantity;
      change = ((current - previous) / previous) * 100;
    }

    return {
      quantity: totalQuantity,
      change: change,
    };
  };

  // Calculate total cost
  const totalCost = expenses.reduce(
    (sum, expense) => sum + expense.totalCost,
    0
  );

  // Get icon color based on expense type
  const getIconColorClasses = (index) => {
    const colors = [
      {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
      },
      {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
      },
      {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-600 dark:text-yellow-400",
      },
      {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
      },
      {
        bg: "bg-indigo-100 dark:bg-indigo-900/20",
        text: "text-indigo-600 dark:text-indigo-400",
      },
    ];
    return colors[index % colors.length];
  };

  // Get unit based on expense type
  const getUnit = (expenseType) => {
    const units = {
      Electricity: "kWh",
      Gas: "m³",
      Water: "m³",
      Fuel: "L",
    };
    return units[expenseType] || "units";
  };

  // Get detailed stats for summary section
  const getDetailedStats = (expenseTypeName) => {
    const utilityExpenses = expenses.filter(
      (expense) => expense.expenseTypeName === expenseTypeName
    );

    if (utilityExpenses.length === 0) {
      return {
        currentUsage: 0,
        average: 0,
        change: 0,
        unit: getUnit(expenseTypeName),
      };
    }

    // Sort expenses by date
    const sortedExpenses = [...utilityExpenses].sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    // Get current usage (most recent)
    const currentUsage = sortedExpenses[0].quantity;

    // Calculate average
    const average =
      utilityExpenses.reduce((sum, expense) => sum + expense.quantity, 0) /
      utilityExpenses.length;

    // Calculate change percentage
    let change = 0;
    if (sortedExpenses.length >= 2) {
      const current = sortedExpenses[0].quantity;
      const previous = sortedExpenses[1].quantity;
      change = ((current - previous) / previous) * 100;
    }

    return {
      currentUsage,
      average,
      change,
      unit: getUnit(expenseTypeName),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      {/* <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Utility Consumption Dashboard
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div> */}

      {/* Expense Table Section */}
      {/* <ExpenseTable /> */}

      {/* Channel Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          // Loading skeleton for Channel Stats
          <>
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {expenseTypes.map((expenseType, index) => {
              const stats = getUtilityStats(expenseType);
              const colorClasses = getIconColorClasses(index);
              return (
                <div
                  key={expenseType}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 flex items-center justify-center ${colorClasses.bg} rounded-lg`}
                      >
                        <KeenIcon
                          icon="electricity"
                          className={colorClasses.text}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {expenseType}
                      </h3>
                    </div>
                    <span
                      className={`text-sm font-medium ${stats.change >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {stats.change > 0 ? "+" : ""}
                      {stats.change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.quantity.toLocaleString()} {getUnit(expenseType)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Monthly consumption
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Total Cost Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <KeenIcon
                      icon="dollar"
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Total Cost
                  </h3>
                </div>
                <span className="text-sm text-yellow-500 font-medium">
                  All Types
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${totalCost.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total expenses
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Peak Hours Alert</h3>
            <KeenIcon icon="notification-bing" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            High consumption detected between 6 PM - 8 PM
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            View Details
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Energy Savings</h3>
            <KeenIcon icon="shield-tick" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            You've saved 15% on electricity this month
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            See How
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Smart Tips</h3>
            <KeenIcon icon="bulb" className="text-white/80" />
          </div>
          <p className="text-white/90 mb-3">
            3 new recommendations for reducing costs
          </p>
          <button className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200">
            Learn More
          </button>
        </div>
      </div>

      {/* Utility Distribution Chart */}
      <UtilityDistribution />

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          // Loading skeleton for Summary Section
          <>
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
              >
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex justify-between items-center"
                    >
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {expenseTypes.map((expenseType, index) => {
              const stats = getDetailedStats(expenseType);
              return (
                <div
                  key={expenseType}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                    {expenseType} Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Current Usage
                      </span>
                      <span className="font-medium">
                        {stats.currentUsage.toLocaleString()} {stats.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Average
                      </span>
                      <span className="font-medium">
                        {stats.average.toFixed(2)} {stats.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">
                        Change
                      </span>
                      <span
                        className={
                          stats.change >= 0 ? "text-green-500" : "text-red-500"
                        }
                      >
                        {stats.change > 0 ? "+" : ""}
                        {stats.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          Status
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stats.change <= 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {stats.change <= 0 ? "Optimal" : "High Usage"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Overall Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Cost
                  </span>
                  <span className="font-medium">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Active Types
                  </span>
                  <span className="font-medium">{expenseTypes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Records
                  </span>
                  <span className="font-medium">{expenses.length}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">
                      Last Updated
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {expenses.length > 0
                        ? new Date(
                            Math.max(
                              ...expenses.map((e) => new Date(e.createdDate))
                            )
                          ).toLocaleDateString()
                        : "No data"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { Demo1LightSidebarContent };
