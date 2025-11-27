import React, { act } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

import {
    Home,
    User,
    ChartColumnBig,
    Activity,
    LogOut,
} from "lucide-react";

interface SideMenuProps {
    className?: string;
    activeItem?: string;
    onItemClick?: (itemId: string) => void;
    userFirstName?: string;
    userLastName?: string;
}

const SideBar: React.FC<SideMenuProps> = ({
    className = "",
    activeItem = "home",
    onItemClick = () => { },
    userFirstName = "FirstName",
    userLastName = "LastName",
}) => {
    const { userId, mail, logout } = useAuth();

    let navigate = useNavigate();

    const menuItems = [
        { id: "home", label: "Accueil", icon: Home, onClick: () => navigate('/') },
        { id: "profile", label: "Profil", icon: User, onClick: () => navigate('/profile') },
        { id: "statistics", label: "Statistiques", icon: ChartColumnBig, onClick: () => navigate('/statistics') },
    ]

    return (
        <div className={`${className} w-64 h-screen bg-neutral-800 text-white flex-col`}>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-white">Compti</h1>
            </div>

            <nav className="flex-1 px-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {onItemClick(item.id); item.onClick()}}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all ${activeItem === item.id
                                ? 'bg-gray-500 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {userFirstName.charAt(0)}{userLastName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-white">{userFirstName} {userLastName}</p>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-red-600" onClick={logout}>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SideBar;