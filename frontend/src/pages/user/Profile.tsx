import { useState, useRef } from "react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

import SideBar from "../../component/SideBar";

export default function Profile() {
    const [activeItem, setActiveItem] = useState<string>("profile");

    return (
        <>
            <div className="flex min-h-screen w-screen bg-stone-900 relative">
                <SideBar
                    className=""
                    activeItem={activeItem}
                    onItemClick={setActiveItem}
                />

                <main className="w-full min-h-screen mt-16 sm:ml-64 sm:mt-2 flex flex-col">
                    <div className="w-full p-2 sm:p-4">

                    </div>
                </main>
            </div>
        </>
    );
}
