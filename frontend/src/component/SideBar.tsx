import React, { act } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

import {
    Home,
    User,
    ChartColumnBig,
    LogOut,
    Menu,
    X
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
}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const { userId, mail, logout } = useAuth();

    let navigate = useNavigate();

    const menuItems = [
        { id: "home", label: "Accueil", icon: Home, onClick: () => navigate('/') },
        { id: "profile", label: "Profil", icon: User, onClick: () => navigate('/profile') },
        { id: "statistics", label: "Statistiques", icon: ChartColumnBig, onClick: () => navigate('/statistics') },
    ]

    return (
        <>
            <button
                className="sm:hidden fixed top-4 left-4 z-50 text-white p-2 bg-neutral-800 rounded-md hover:bg-neutral-700"
                onClick={() => setOpen(true)}
            >
                <Menu className="w-7 h-7" />
            </button>

            <div className={`${className} fixed sm:translate-x-0 left-0 top-0 w-64 h-screen bg-neutral-800 text-white flex flex-col z-50
                    transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
                    pb-[env(safe-area-inset-bottom)]`}>

                <button
                    className="sm:hidden text-gray-300 top-4 right-4 absolute p-2 hover:text-white"
                    onClick={() => setOpen(false)}
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white">Compti</h1>

                </div>

                <nav className="flex-1 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onItemClick(item.id); item.onClick(); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-md transition-all ${activeItem === item.id
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
                    <button className="flex items-center gap-3 flex-row p-2 text-gray-300 hover:text-red-600" onClick={logout}>
                        <p className="font-medium text-white">Se déconnecter</p>
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default SideBar;