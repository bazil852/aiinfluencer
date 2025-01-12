import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2, Save, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface UserUsage {
  user_id: string;
  avatars_created: number;
  video_minutes_used: number;
  ai_clone_created: number;
  automation: boolean;
  ai_editing: boolean;
  videos_created: number;
  auth_users_view: {
    email: string;
  };
}

export default function UsagePanel() {
  const [usageData, setUsageData] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<UserUsage>>({});

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // First get all users with their emails
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('auth_user_id, email');

      if (usersError) throw usersError;

      // Then get usage data
      const { data, error } = await supabase
        .from('user_usage')
        .select('*');

      if (error) throw error;

      // Combine the data
      const combinedData = (data || []).map(usage => {
        const user = users?.find(u => u.auth_user_id === usage.user_id);
        return {
          ...usage,
          auth_users_view: {
            email: user?.email || 'Unknown'
          }
        };
      });

      setUsageData(combinedData);
    } catch (err) {
      console.error('Error fetching usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_usage')
        .update(editedValues)
        .eq('user_id', userId);

      if (error) throw error;
      
      setEditingRow(null);
      setEditedValues({});
      await fetchUsageData();
    } catch (err) {
      console.error('Error updating usage:', err);
    }
  };

  const columnHelper = createColumnHelper<UserUsage>();

  const columns: ColumnDef<UserUsage, any>[] = [
    columnHelper.accessor('auth_users_view.email', {
      header: 'User Email',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('avatars_created', {
      header: 'Avatars Created',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="number"
            value={editedValues.avatars_created ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              avatars_created: parseInt(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('video_minutes_used', {
      header: 'Video Minutes Used',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="number"
            value={editedValues.video_minutes_used ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              video_minutes_used: parseInt(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('videos_created', {
      header: 'Videos Created',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="number"
            value={editedValues.videos_created ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              videos_created: parseInt(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('ai_clone_created', {
      header: 'AI Clones Created',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="number"
            value={editedValues.ai_clone_created ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              ai_clone_created: parseInt(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('automation', {
      header: 'Automation',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="checkbox"
            checked={editedValues.automation ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              automation: e.target.checked
            })}
            className="w-4 h-4"
          />
        ) : (
          <span>{getValue() ? 'Yes' : 'No'}</span>
        );
      },
    }),
    columnHelper.accessor('ai_editing', {
      header: 'AI Editing',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <input
            type="checkbox"
            checked={editedValues.ai_editing ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              ai_editing: e.target.checked
            })}
            className="w-4 h-4"
          />
        ) : (
          <span>{getValue() ? 'Yes' : 'No'}</span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isEditing = editingRow === row.original.user_id;
        return isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(row.original.user_id)}
              className="p-1 text-green-500 hover:text-green-600"
              title="Save"
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setEditingRow(null);
                setEditedValues({});
              }}
              className="p-1 text-red-500 hover:text-red-600"
              title="Cancel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingRow(row.original.user_id)}
            className="text-blue-500 hover:text-blue-600"
          >
            Edit
          </button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usageData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">User Usage Management</h1>

      {loading ? (
        <div className="flex items-center justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
        </div>
      )}
    </div>
  );
}