import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  tier: string;
  subscription_id?: string;
  [key: string]: any;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
      console.log(data);
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

  const handleChange = (field: keyof User, value: string) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = (rowIndex: number) => {
    setEditIndex(rowIndex);
    setEditUser(users[rowIndex]);
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditUser({});
  };

  const handleDelete = (userId: string) => {
    alert("Delete functionality would go here in the full implementation");
  };

  const columnHelper = createColumnHelper<User>();

  const columns: ColumnDef<User, any>[] = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
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
            type="text"
            className="border border-gray-300 rounded px-2 py-1"
            value={editUser.tier ?? currentTier}
            onChange={(e) => handleChange("tier", e.target.value)}
          />
        ) : (
          currentTier
        );
      },
    }),
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
                  onClick={() => {
                    alert(
                      "Save functionality would go here in the full implementation"
                    );
                    handleCancel();
                  }}
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

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Users</h1>
      {loading ? (
        <div className="flex items-center justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
