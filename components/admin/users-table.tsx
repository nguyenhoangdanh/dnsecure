"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SkeletonTable } from "../loading/skeleton-table"
import { useLoadingState } from "../loading/use-loading-state"
import { LoadingButton } from "../loading/loading-button"

const data: User[] = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        role: "Admin",
        status: "active",
        lastActive: "Hôm nay, 10:30",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "2",
        name: "Trần Thị B",
        email: "tranthib@example.com",
        role: "User",
        status: "active",
        lastActive: "Hôm nay, 09:15",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "3",
        name: "Lê Văn C",
        email: "levanc@example.com",
        role: "Editor",
        status: "inactive",
        lastActive: "Hôm qua, 15:45",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "4",
        name: "Phạm Thị D",
        email: "phamthid@example.com",
        role: "User",
        status: "active",
        lastActive: "Hôm nay, 11:20",
        avatar: "/placeholder.svg?height=32&width=32",
    },
    {
        id: "5",
        name: "Hoàng Văn E",
        email: "hoangvane@example.com",
        role: "Moderator",
        status: "pending",
        lastActive: "3 ngày trước",
        avatar: "/placeholder.svg?height=32&width=32",
    },
]

export type User = {
    id: string
    name: string
    email: string
    role: string
    status: "active" | "inactive" | "pending"
    lastActive: string
    avatar: string
}

export function UsersTable() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const { isLoading, startLoading, stopLoading } = useLoadingState();
    const [isDataLoading, setIsDataLoading] = React.useState(true)

    React.useEffect(() => {
        // Giả lập loading dữ liệu
        const timer = setTimeout(() => {
            setIsDataLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    const handleRefresh = () => {
        setIsDataLoading(true)
        setTimeout(() => {
            setIsDataLoading(false)
        }, 1500)
    }

    const handleExport = () => {
        startLoading("Đang xuất dữ liệu...")
        setTimeout(() => {
            stopLoading()
        }, 2000)
    }

    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Tên",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={row.original.avatar || "/placeholder.svg"} alt={row.original.name} />
                        <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Vai trò
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("role")}</div>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === "active" ? "success" : status === "inactive" ? "destructive" : "outline"}>
                        {status === "active" ? "Hoạt động" : status === "inactive" ? "Không hoạt động" : "Chờ xử lý"}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "lastActive",
            header: "Hoạt động cuối",
            cell: ({ row }) => <div>{row.getValue("lastActive")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Sao chép ID</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    if (isDataLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Input placeholder="Tìm kiếm người dùng..." className="max-w-sm" disabled value={""} />
                    <div className="flex gap-2">
                        <Button variant="outline" disabled>
                            Làm mới
                        </Button>
                        <Button variant="outline" disabled>
                            Cột
                        </Button>
                    </div>
                </div>
                <SkeletonTable rows={5} columns={6} />
            </div>
        )
    }


    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                <div className="ml-auto flex gap-2">
                    <LoadingButton variant="outline" onClick={handleExport} isLoading={isLoading}>
                        Xuất dữ liệu
                    </LoadingButton>
                    <Button variant="outline" onClick={handleRefresh}>
                        Làm mới
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Cột <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id === "name"
                                                ? "Tên"
                                                : column.id === "role"
                                                    ? "Vai trò"
                                                    : column.id === "status"
                                                        ? "Trạng thái"
                                                        : column.id === "lastActive"
                                                            ? "Hoạt động cuối"
                                                            : column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Không tìm thấy kết quả.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} trong {table.getFilteredRowModel().rows.length} hàng được
                    chọn.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Trước
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Sau
                    </Button>
                </div>
            </div>
        </div>
    )
}
