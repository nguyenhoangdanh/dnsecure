import { SettingsForm } from "@/components/admin/settings-form";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
                <p className="text-muted-foreground">Quản lý cài đặt và tùy chọn cho hệ thống của bạn</p>
            </div>
            <SettingsForm />
        </div>
    )
}
