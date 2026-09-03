import { Navigate } from "react-router-dom";

export default function Register() {
  return <Navigate to={{ pathname: "/login", search: window.location.search }} replace />;
}