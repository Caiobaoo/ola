"use client";
import { ClipboardList, Heart, Home, Pill, UserCircle, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuNavigation() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/user/perfil", icon: UserCircle, label: "Perfil" },
    { href: "/pacient", icon: Users, label: "Pacientes" },
    { href: "/register-med", icon: Pill, label: "Medicações" },
    { href: "/user/medications", icon: ClipboardList, label: "Relatórios Diversos" },
    { href: "/user", icon: UserPlus, label: "Completar Cadastro" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-50">
      {menuItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center ${pathname === href ? "text-emerald-500" : "text-gray-400"}`}
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs mt-1 hidden sm:block">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
