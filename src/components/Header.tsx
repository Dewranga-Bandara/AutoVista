import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

export default function Header() {
  const [pageState, setPageState] = useState<string>("Sign in");

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setPageState("Profile");
      } else {
        setPageState("Sign in");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  function pathMatchRoute(route: string): boolean {
    return location.pathname === route;
  }

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src="" // Add your logo URL here
            alt="logo"
            className="h-5 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-sm font-semibold ${
                pathMatchRoute("/") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
              }`}
              onClick={() => navigate("/")}
            >
              Home
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold ${
                pathMatchRoute("/offers") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
              }`}
              onClick={() => navigate("/offers")}
            >
              Offers
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold ${
                pathMatchRoute("/profile") ? "text-black border-b-red-500" : "text-gray-400 border-b-transparent"
              }`}
              onClick={() => navigate("/profile")}
            >
              {pageState}
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}
