import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import InfluencerRequestsPanel from "./InfluencerRequestsPanel";

interface User {
  id: string;
  email: string;
}

interface Influencer {
  id: string;
  user_id: string;
  name: string;
  template_id: string;
  created_at: string;
  updated_at: string;
  auth_users_view: any;
}

// Sample users for the dropdown
const sampleUsers: User[] = [
  { id: "user1", email: "john@example.com" },
  { id: "user2", email: "jane@example.com" },
  { id: "user3", email: "bob@example.com" },
  { id: "user4", email: "alice@example.com" },
];

export default function InfluencersPanel() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'influencers' | 'requests'>('influencers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInfluencer, setNewInfluencer] = useState<Partial<Influencer>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users on component mount
  useEffect(() => {
    fetchInfluencers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users from Supabase
  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("influencers").select(`
        *,
        auth_users_view (
          *
        )
      `);
      console.log(data);
      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setInfluencers(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = sampleUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setNewInfluencer((prev) => ({ ...prev, user_id: user.id }));
    setShowDropdown(false);
    setSearchTerm("");
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setNewInfluencer((prev) => ({ ...prev, user_id: undefined }));
  };

  const columnHelper = createColumnHelper<Influencer>();

  const columns: ColumnDef<Influencer, any>[] = [
    // columnHelper.accessor("id", {
    //   header: "ID",
    //   cell: (info) => info.getValue(),
    // }),
    // columnHelper.accessor("user_id", {
    //   header: "User ID",
    //   cell: (info) => info.getValue(),
    // }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("template_id", {
      header: "Template ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("auth_users_view", {
      header: "Created By",
      cell: (info) => info.getValue().email,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => alert("Edit functionality would go here")}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => alert("Delete functionality would go here")}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: influencers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleAddInfluencer = () => {
    alert("Add influencer functionality would go here");
    setShowAddModal(false);
    setNewInfluencer({});
    setSelectedUser(null);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('influencers')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'influencers'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Influencers
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requests
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <InfluencerRequestsPanel />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Influencers</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle size={20} />
              Add Influencer
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Add New Influencer</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-white mb-1">
                  Select User
                </label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-2 border rounded-md bg-gray-800">
                    <span className="text-white">{selectedUser.email}</span>
                    <button
                      onClick={clearSelectedUser}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full p-2 border rounded-md pr-10 bg-gray-800 text-white placeholder-gray-400"
                      />
                      <Search
                        className="absolute right-3 top-2.5 text-gray-400"
                        size={20}
                      />
                    </div>
                    {showDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                              onClick={() => handleUserSelect(user)}
                            >
                              {user.email}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-400">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newInfluencer.name || ""}
                  onChange={(e) =>
                    setNewInfluencer({ ...newInfluencer, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Template ID
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newInfluencer.template_id || ""}
                  onChange={(e) =>
                    setNewInfluencer({
                      ...newInfluencer,
                      template_id: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser(null);
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInfluencer}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}