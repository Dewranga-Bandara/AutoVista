import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { FaSearch } from "react-icons/fa";

import logo from '../assets/svg/logo.svg';

export default function Header() {
  const [pageState, setPageState] = useState<string>("Sign in");

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);


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
    <div className="bg-slate-100 border-b shadow-md sticky top-0 z-40 p-2 sm:p-4">
  <header className="flex flex-col sm:flex-row justify-between items-center px-4 max-w-6xl mx-auto">

  <div className='hidden sm:block'>
      <img
        src={logo} // Update path as needed
        alt="logo"
        className={`h-12 cursor-pointer rounded-lg transition-transform transform hover:scale-105`}
        onClick={() => navigate("/")}
      />
    </div>

    <div className="flex flex-row justify-between">
    <form onSubmit={handleSubmit} className=' p-2 rounded-lg flex items-center shadow-sm w-full sm:w-auto mt-2 sm:mt-0'>
      <input
        type='text'
        placeholder='Search...'
        className='bg-white focus:outline-none w-full sm:w-64 px-3 py-2 rounded-lg text-gray-500 border border-slate-200'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="ml-2 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        <FaSearch />
      </button>        
    </form>

    <button 
      className="sm:hidden p-2 text-gray-600 hover:text-blue-500 focus:outline-none justify-end"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
      </svg>
    </button>

    </div>

    <nav className={`w-full sm:w-auto ${isMenuOpen ? 'block' : 'hidden'} sm:block mt-2 sm:mt-0`}>
      <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
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
