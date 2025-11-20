import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react';

interface ProtectedRouteProps {
    children: JSX.Element;
    allowedRoles?: number[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const {isAuthenticated, loading} = useAuth();

    if(loading){
        return <div>Loading...</div>;
    }

    if(!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}