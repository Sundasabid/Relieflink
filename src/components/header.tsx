
"use client";

import Link from "next/link";
import { LogIn, LogOut, User as UserIcon, Replace } from "lucide-react";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "./icons";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/firebase/firestore";

export default function Header() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    console.log("User signed out successfully.");
    router.push("/");
  };
  
  const handleSwitchRole = async () => {
    if (user) {
      await updateUserProfile(user.uid, { role: 'unassigned' });
      router.push('/role-select');
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline inline-block">ReliefLink</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.photoURL ?? ""}
                        alt={userProfile?.name ?? ""}
                      />
                      <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href="/dashboard">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSwitchRole}>
                    <Replace className="mr-2 h-4 w-4" />
                    <span>Switch Role</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4"/>
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
