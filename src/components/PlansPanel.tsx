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

interface Plan {
  id: number;
  plan_name: string;
  price: number;
  avatars: string;
  ai_cloning: string;
  automations: string;
  ai_editing: string;
  video_creation: string;
  video_minutes_bonus: number;
  video_creation_rate: number;
  video_editing_rate: string;
}

export default function PlansPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Plan>>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('id');

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: number) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update(editedValues)
        .eq('id', id);

      if (error) throw error;
      
      setEditingRow(null);
      setEditedValues({});
      await fetchPlans();
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  const parseJsonField = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' ? parsed.limit || parsed.enabled : parsed;
    } catch {
      return value;
    }
  };

  const formatJsonField = (value: any, field: string) => {
    if (field === 'automations' || field === 'ai_editing') {
      return JSON.stringify({ enabled: value });
    }
    return JSON.stringify({ limit: value });
  };

  const columnHelper = createColumnHelper<Plan>();

  const columns: ColumnDef<Plan, any>[] = [
    columnHelper.accessor('plan_name', {
      header: 'Plan Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => `$${info.getValue()}`,
    }),
    columnHelper.accessor('avatars', {
      header: 'Avatars Limit',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        const value = parseJsonField(getValue());
        return isEditing ? (
          <input
            type="number"
            value={editedValues.avatars !== undefined ? parseJsonField(editedValues.avatars) : value}
            onChange={(e) => setEditedValues({
              ...editedValues,
              avatars: formatJsonField(e.target.value, 'avatars')
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : value === -1 ? '∞' : value;
      },
    }),
    columnHelper.accessor('ai_cloning', {
      header: 'AI Cloning Limit',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        const value = parseJsonField(getValue());
        return isEditing ? (
          <input
            type="number"
            value={editedValues.ai_cloning !== undefined ? parseJsonField(editedValues.ai_cloning) : value}
            onChange={(e) => setEditedValues({
              ...editedValues,
              ai_cloning: formatJsonField(e.target.value, 'ai_cloning')
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : value === -1 ? '∞' : value;
      },
    }),
    columnHelper.accessor('video_creation', {
      header: 'Video Creation Limit',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        const value = parseJsonField(getValue());
        return isEditing ? (
          <input
            type="number"
            value={editedValues.video_creation !== undefined ? parseJsonField(editedValues.video_creation) : value}
            onChange={(e) => setEditedValues({
              ...editedValues,
              video_creation: formatJsonField(e.target.value, 'video_creation')
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : value === -1 ? '∞' : value;
      },
    }),
    columnHelper.accessor('video_minutes_bonus', {
      header: 'Video Minutes Bonus',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        return isEditing ? (
          <input
            type="number"
            value={editedValues.video_minutes_bonus ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              video_minutes_bonus: parseInt(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('video_creation_rate', {
      header: 'Creation Rate',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        return isEditing ? (
          <input
            type="number"
            step="0.1"
            value={editedValues.video_creation_rate ?? getValue()}
            onChange={(e) => setEditedValues({
              ...editedValues,
              video_creation_rate: parseFloat(e.target.value)
            })}
            className="w-20 px-2 py-1 border rounded bg-gray-800 text-white"
          />
        ) : getValue();
      },
    }),
    columnHelper.accessor('automations', {
      header: 'Automations',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        const value = parseJsonField(getValue());
        return isEditing ? (
          <input
            type="checkbox"
            checked={editedValues.automations !== undefined ? parseJsonField(editedValues.automations) : value}
            onChange={(e) => setEditedValues({
              ...editedValues,
              automations: formatJsonField(e.target.checked, 'automations')
            })}
            className="w-4 h-4"
          />
        ) : (
          <span>{value ? 'Yes' : 'No'}</span>
        );
      },
    }),
    columnHelper.accessor('ai_editing', {
      header: 'AI Editing',
      cell: ({ row, getValue }) => {
        const isEditing = editingRow === row.original.id;
        const value = parseJsonField(getValue());
        return isEditing ? (
          <input
            type="checkbox"
            checked={editedValues.ai_editing !== undefined ? parseJsonField(editedValues.ai_editing) : value}
            onChange={(e) => setEditedValues({
              ...editedValues,
              ai_editing: formatJsonField(e.target.checked, 'ai_editing')
            })}
            className="w-4 h-4"
          />
        ) : (
          <span>{value ? 'Yes' : 'No'}</span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isEditing = editingRow === row.original.id;
        return isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(row.original.id)}
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
            onClick={() => setEditingRow(row.original.id)}
            className="text-blue-500 hover:text-blue-600"
          >
            Edit
          </button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: plans,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Plans Management</h1>

      {loading ? (
        <div className="flex items-center justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
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
                        className="px-3 py-4 whitespace-nowrap text-sm text-gray-900"
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