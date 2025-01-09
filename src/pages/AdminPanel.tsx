import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Define the shape of your user data
interface User {
  id: string;
  email: string;
  tier: string;
  subscription_id?: string;
  [key: string]: any; // For any other columns you might have
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Track editing state
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editUser, setEditUser] = useState<Partial<User>>({});

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Begin editing a user row
  const handleEditClick = (rowIndex: number) => {
    setEditIndex(rowIndex);
    setEditUser(users[rowIndex]);
  };

  // Handle input changes in the Edit form
  const handleChange = (field: keyof User, value: string) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes to Supabase
//   const handleSave = async (index: number) => {
//     if (!editUser.id) return;

//     try {
//       const { data, error } = await supabase
//         .from("users")
//         .update({
//           email: editUser.email,
//           // ... Add other fields you'd like to update
//         })
//         .match({ id: editUser.id });

//       if (error) {
//         console.error("Error updating user:", error);
//         alert("Failed to update user");
//       } else if (data) {
//         // Update local state
//         const updatedUsers = [...users];
//         updatedUsers[index] = data[0]; // Supabase returns the updated record in data[0]
//         setUsers(updatedUsers);
//         alert("User updated successfully!");
//       }
//     } catch (err) {
//       console.error("Unexpected error updating user:", err);
//       alert("An unexpected error occurred while updating.");
//     } finally {
//       setEditIndex(null);
//       setEditUser({});
//     }
//   };

  // Cancel editing
  const handleCancel = () => {
    setEditIndex(null);
    setEditUser({});
  };

  // Delete a user from Supabase
  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .match({ id: userId });

      if (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      } else {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        alert("User deleted successfully!");
      }
    } catch (err) {
      console.error("Unexpected error deleting user:", err);
      alert("An unexpected error occurred while deleting.");
    }
  };

  /**
   * ------------------------------
   * TANSTACK REACT TABLE SETUP
   * ------------------------------
   */
  const columnHelper = createColumnHelper<User>();

  const columns: ColumnDef<User, any>[] = [
    // ID column
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    // Email column
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => {
        const rowIndex = info.row.index;
        const isEditing = editIndex === rowIndex;
        const currentEmail = info.getValue() as string;

        return isEditing ? (
          <input
            type="email"
            className="border border-gray-300 rounded px-2 py-1"
            value={editUser.email ?? currentEmail}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        ) : (
          currentEmail
        );
      },
    }),
    columnHelper.accessor("tier", {
        header: "Tier",
        cell: (info) => {
          const rowIndex = info.row.index;
          const isEditing = editIndex === rowIndex;
          const currentTier = info.getValue() as string;
  
          return isEditing ? (
            <input
              type="tier"
              className="border border-gray-300 rounded px-2 py-1"
              value={editUser.tier ?? currentTier}
              onChange={(e) => handleChange("tier", e.target.value)}
            />
          ) : (
            currentTier
          );
        },
      }),
    // Optional: Example of a tier column
    // columnHelper.accessor("tier", {
    //   header: "Tier",
    //   cell: (info) => info.getValue() || "N/A",
    // }),

    // Actions column
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const rowIndex = row.index;
        const isEditing = editIndex === rowIndex;

        return (
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                //   onClick={() => handleSave(rowIndex)}
                  className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="text-white bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEditClick(rowIndex)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        );
      },
      header: "Actions",
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /**
   * ------------------------------
   * RENDERING
   * ------------------------------
   */
  if (loading) {
    return <p className="text-center mt-10">Loading users...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Admin Panel - Users
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Dashboard
        </button>
      </div>
    </div>
  );
}
