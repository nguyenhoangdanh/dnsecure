import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function SettingsForm() {
    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Chung</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
                <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle>Cài đặt chung</CardTitle>
                        <CardDescription>Quản lý cài đặt chung cho hệ thống của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="site-name">Tên trang web</Label>
                            <Input id="site-name" defaultValue="Admin Dashboard" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="site-description">Mô tả</Label>
                            <Textarea id="site-description" defaultValue="Hệ thống quản trị dành cho doanh nghiệp" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone">Múi giờ</Label>
                            <Select defaultValue="asia-ho_chi_minh">
                                <SelectTrigger id="timezone">
                                    <SelectValue placeholder="Chọn múi giờ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asia-ho_chi_minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                                    <SelectItem value="america-new_york">America/New_York (GMT-5)</SelectItem>
                                    <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language">Ngôn ngữ</Label>
                            <Select defaultValue="vi">
                                <SelectTrigger id="language">
                                    <SelectValue placeholder="Chọn ngôn ngữ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="fr">Français</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="dark-mode">Chế độ tối</Label>
                                <p className="text-sm text-muted-foreground">Bật chế độ tối cho giao diện</p>
                            </div>
                            <Switch id="dark-mode" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Hủy</Button>
                        <Button>Lưu thay đổi</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="security">
                <Card>
                    <CardHeader>
                        <CardTitle>Bảo mật</CardTitle>
                        <CardDescription>Quản lý cài đặt bảo mật cho hệ thống của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Mật khẩu mới</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="two-factor">Xác thực hai yếu tố</Label>
                                <p className="text-sm text-muted-foreground">Bật xác thực hai yếu tố để tăng cường bảo mật</p>
                            </div>
                            <Switch id="two-factor" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Hủy</Button>
                        <Button>Lưu thay đổi</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="notifications">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông báo</CardTitle>
                        <CardDescription>Quản lý cài đặt thông báo cho hệ thống của bạn</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications">Thông báo qua email</Label>
                                <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                                <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                            </div>
                            <Switch id="push-notifications" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketing-emails">Email tiếp thị</Label>
                                <p className="text-sm text-muted-foreground">Nhận email về sản phẩm và dịch vụ mới</p>
                            </div>
                            <Switch id="marketing-emails" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline">Hủy</Button>
                        <Button>Lưu thay đổi</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
