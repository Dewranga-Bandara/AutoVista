import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { FaSearch } from "react-icons/fa";

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

  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [window.location.search]);

  function pathMatchRoute(route: string): boolean {
    return location.pathname === route;
  }

  return (
    <div className="bg-white border-b shadow-md sticky top-0 z-40 p-2">
  <header className="flex justify-between items-center px-4 max-w-6xl mx-auto">
    <div>
      <img
        src="src/assets/svg/logo.svg" // Update path as needed
        alt="logo"
        className="h-12 cursor-pointer rounded-lg transition-transform transform hover:scale-105"
        onClick={() => navigate("/")}
      />
    </div>
    <form onSubmit={handleSubmit} className='p-2 rounded-lg flex items-center shadow-sm'>
      <input
        type='text'
        placeholder='Search...'
        className='bg-transparent focus:outline-none w-full sm:w-64 px-3 py-2 rounded-lg text-gray-700'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="ml-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        <FaSearch />
      </button>        
    </form>
    <nav>
      <ul className="flex space-x-6">
        <li
          className={`cursor-pointer py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
            pathMatchRoute("/") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => navigate("/")}
        >
          Home
        </li>
        <li
          className={`cursor-pointer py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
            pathMatchRoute("/offers") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => navigate("/offers")}
        >
          Offers
        </li>
        <li
          className={`cursor-pointer py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
            pathMatchRoute("/aboutUs") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => navigate("/aboutUs")}
        >
          About Us
        </li>
        <li
          className={`cursor-pointer py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${
            pathMatchRoute("/profile") ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"
          }`}
          onClick={() => navigate("/profile")}
        >
          {pageState}
        </li>
      </ul>
    </nav>
  </header>
</div>
  );
}
