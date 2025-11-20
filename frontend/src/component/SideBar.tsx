import React, { act } from "react";
import { useAuth } from "../context/AuthContext";

interface SideMenuProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  userFirstName?: string;
  userLastName?: string;
}

const SideBar: React.FC<SideMenuProps> = ({
    activeItem = "home",
    onItemClick = () => {},
    userFirstName = "FirstName",
    userLastName = "LastName",
}) => {
    const { userId, mail, logout } = useAuth();
};

export default SideBar;