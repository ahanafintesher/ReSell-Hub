"use client";
import { Playfair_Display } from "next/font/google";

import {
    Avatar,
    AvatarImage,
    AvatarFallback,
    Dropdown,
    DropdownTrigger,
    DropdownPopover,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button,
    Label,
    Description,
    Header,
    Separator,
    Drawer,
} from "@heroui/react";
import {
    User,
    Home,
    LogOut,
    LayoutDashboard,
    GraduationCap,
    ChevronDown,
    Menu,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { navMenu, NavContent } from "./DashboardSidebar";
const play = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
export default function Navbar() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/auth/login");
                    router.refresh();
                },
            },
        });
    };

    const user = session?.user;
    const role = user?.role || "buyer";
    const menu = navMenu[role] || [];
    const displayName = user?.name || "Guest";
    const displayEmail = user?.email || "";
    const avatarSrc = user?.image || undefined;
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <nav className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
            <div className="mx-auto flex px-3 items-center justify-between">
                {/* Left: Mobile Drawer Trigger + Brand */}
                <div className="flex items-center gap-3">
                    <div className="lg:hidden">
                        <Drawer>
                            <Drawer.Trigger className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Drawer.Trigger>
                            <Drawer.Content>
                                <Drawer.Header>
                                    <Drawer.Title>
                                        <div className="flex items-center justify-between">
                                            <h2 className={`${play.className} text-emerald-600 text-2xl font-bold`}>
                                                ReSell Hub
                                            </h2>
                                        </div>
                                        <p className="mt-0.5 text-xs font-semibold text-slate-500 capitalize">{role} Dashboard</p>
                                    </Drawer.Title>
                                </Drawer.Header>
                                <Drawer.Body>
                                    <NavContent navItems={menu} />
                                </Drawer.Body>
                            </Drawer.Content>
                        </Drawer>
                    </div>
                    <div>
                        <Link href="/" className="hover:opacity-90 transition-opacity">
                            <h1 className={`${play.className} font-extrabold text-xl text-gray-900`}>
                                ReSell Hub
                            </h1>
                        </Link>
                    </div>
                </div>

                {/* Center: Dashboard indicator */}

                {/* Right: User dropdown */}
                <div className="flex items-center gap-3">
                    {isPending ? (
                        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                    ) : session ? (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
                                >
                                    <Avatar
                                        size="sm"
                                        className="h-8 w-8 border border-slate-200"
                                    >
                                        <AvatarImage src={avatarSrc} alt={displayName} />
                                        <AvatarFallback className="bg-emerald-600 text-white font-semibold">
                                            {initials || <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium text-slate-800 capitalize sm:inline">
                                        {displayName}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                                </Button>
                            </DropdownTrigger>

                            <DropdownPopover
                                className="min-w-[220px]"
                                placement="bottom end"
                                crossOffset={-10}
                            >
                                <DropdownMenu>
                                    {/* User info header */}
                                    <DropdownSection>
                                        <Header>
                                            <div className="flex items-center gap-3 px-1 py-1">
                                                <Avatar size="sm">
                                                    <AvatarImage
                                                        src={avatarSrc}
                                                        alt={displayName}
                                                    />
                                                    <AvatarFallback>
                                                        {initials || <User className="h-4 w-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Label className="font-semibold">
                                                        {displayName}
                                                    </Label> <br />
                                                    <Description className="text-xs text-default-500">
                                                        {displayEmail}
                                                    </Description>
                                                </div>
                                            </div>
                                        </Header>
                                    </DropdownSection>

                                    <Separator />

                                    {/* Profile */}
                                    <DropdownItem
                                        key="profile"
                                        onAction={() => router.push("/dashboard/buyer/profile")}
                                    >
                                        <div className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-default-500" />
                                            <Label>Profile</Label>
                                        </div>
                                    </DropdownItem>

                                    {/* Home */}
                                    <DropdownItem
                                        key="home"
                                        onAction={() => router.push("/")}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Home className="h-4 w-4 text-default-500" />
                                            <Label>Home</Label>
                                        </div>
                                    </DropdownItem>

                                    <Separator />

                                    {/* Logout */}
                                    <DropdownItem
                                        key="logout"
                                        className="text-danger"
                                        onAction={handleLogout}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LogOut className="h-4 w-4" />
                                            <Label>Logout</Label>
                                        </div>
                                    </DropdownItem>
                                </DropdownMenu>
                            </DropdownPopover>
                        </Dropdown>
                    ) : (
                        <Button
                            variant="light"
                            className="text-gray-700"
                            onPress={() => router.push("/auth/login")}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
}