'use client';

import React, { useState, useEffect } from 'react';
import {
  DataTable,
  TableColumn,
  DialogConfig
} from 'react-table-power';

// Basic data type with required fields
interface SimpleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

// Simplified form component
const UserForm = React.forwardRef<any, any>((props, ref) => {
  const { data, onSubmit, dialogType, isReadOnly } = props;
  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    role: data?.role || 'user',
    status: data?.status || 'pending'
  });
  
  // Log for debugging
  console.log("UserForm render", { dialogType, data, ref });
  
  // Expose form methods to parent
  React.useImperativeHandle(ref, () => ({
    getValidatedValues: async () => {
      // Log for debugging
      console.log("getValidatedValues called, returning:", formData);
      return { ...formData };
    },
    // Required to mark form as dirty
    formState: { isDirty: true },
    // Other methods that might be used by OptimizedDialog
    getValues: () => formData,
    isDirty: true
  }), [formData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-xs">
        Form rendered for dialog type: {dialogType}
      </div>
      
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full border p-2 rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full border p-2 rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm mb-1">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full border p-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={isReadOnly}
          className="w-full border p-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
});

UserForm.displayName = 'UserForm';

// Generate sample data
const generateUsers = (count: number): SimpleUser[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'user' : 'guest',
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending'
  }));
};

export default function DialogTroubleshootingPage() {
  // State for users data
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load sample data
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setUsers(generateUsers(25));
      setLoading(false);
    }, 500);
  }, []);
  
  // Column definitions
  const columns: TableColumn<SimpleUser>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ value }) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    }
  ];
  
  // CRUD handlers
  const handleCreate = async (data: SimpleUser) => {
    console.log("Create handler called with data:", data);
    
    const newUser = {
      ...data,
      id: Math.max(0, ...users.map(u => u.id)) + 1
    };
    
    setUsers(prev => [newUser, ...prev]);
    return true; // Success response for dialog
  };
  
  const handleUpdate = async (data: SimpleUser) => {
    console.log("Update handler called with data:", data);
    
    setUsers(prev => 
      prev.map(user => user.id === data.id ? { ...data } : user)
    );
    return true; // Success response for dialog
  };
  
  const handleDelete = async (id?: string | number) => {
    console.log("Delete handler called for id:", id);
    
    if (id) {
      setUsers(prev => prev.filter(user => user.id !== id));
      return true; // Success response for dialog
    }
    return false;
  };
  
  // Log to see if component is re-rendering too much
  console.log("DialogTroubleshootingPage render", { usersCount: users.length });
  
  // Dialog configuration
  const dialogConfig: DialogConfig = {
    closeOnClickOutside: false,
    closeOnEsc: true,
    width: '500px'
  };
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dialog Troubleshooting</h1>
        <p className="text-gray-600">
          A minimal example to diagnose dialog rendering issues
        </p>
      </div>
      
      <DataTable
        data={users}
        columns={columns}
        title="Users"
        loading={loading}
        striped
        hover
        builtInActions={{
          create: true,
          edit: true,
          view: true,
          delete: true,
          createFormComponent: UserForm,
          editFormComponent: UserForm,
          viewFormComponent: UserForm,
          formHandling: {
            autoHandleFormSubmission: true,
            formInterface: 'react-hook-form'
          }
        }}
        dialog={dialogConfig}
        eventHandlers={{
          onCreate: handleCreate,
          onUpdate: handleUpdate,
          onDelete: handleDelete,
          // Debug callbacks
          onAfterSubmit: (type, data, success) => {
            console.log("After submit:", type, data, success);
          }
        }}
      />
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h2 className="font-semibold">Debug Info</h2>
        <pre className="bg-gray-100 p-2 mt-2 text-xs overflow-auto rounded">
          {JSON.stringify({ users: users.length }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
