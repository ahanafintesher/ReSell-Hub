"use client";

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
} from "@heroui/react";
import {
    User,
    Home,
    LogOut,
    LayoutDashboard,
    GraduationCap,
    ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
                {/* Left: Brand */}
                <div className="flex items-center gap-3">
                    
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">
                            ReSell Hub
                        </h1>
                        
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
                                    variant="light"
                                    className="flex items-center gap-2 rounded-full px-2 py-1 text-gray-700 hover:bg-gray-100"
                                >
                                    <Avatar
                                        size="sm"
                                        className="h-8 w-8 border-2 border-gray-200"
                                    >
                                        <AvatarImage src={avatarSrc} alt={displayName} />
                                        <AvatarFallback>
                                            {initials || <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden text-sm font-medium text-gray-900 sm:inline">
                                        {displayName}
                                    </span>
                                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
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
                                        onAction={() => router.push("/profile")}
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