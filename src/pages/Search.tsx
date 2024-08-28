import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import your Firebase configuration
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import ListingItem from '../components/ListingItem';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    type: 'rent',
    name: '',
    manufacturer: '',
    model: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    offer: false,
    minPrice: '',
    maxPrice: '',
    sortBy: 'priceLowToHigh',
  });
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extract query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newParams: any = {};
    params.forEach((value, key) => {
      newParams[key] = value;
    });
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeSelect = (type: string) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      type
    }));
  };

  function handleAction() {
    // Here you can add any additional logic if needed before refreshing
    window.location.reload(); // Refresh the page
  }

  const handleSearch = async () => {
    try {
      setLoading(true);

      // Initialize query
      let q = query(collection(db, 'listings'));

      // Array to hold query constraints
      const constraints: any[] = [];

      // Add constraints conditionally
      if (searchParams.type) {
        constraints.push(where('type', '==', searchParams.type));
      }
      if (searchParams.manufacturer) {
        constraints.push(
          where('manufacturer', '>=', searchParams.manufacturer),
          where('manufacturer', '<=', searchParams.manufacturer + '\uf8ff')
        );
      }
      if (searchParams.minPrice) {
        constraints.push(where('regularPrice', '>=', parseFloat(searchParams.minPrice)));
      }
      if (searchParams.maxPrice) {
        constraints.push(where('regularPrice', '<=', parseFloat(searchParams.maxPrice)));
      }

      // Apply constraints to query
      q = query(q, ...constraints);

      // Apply sorting
      if (searchParams.sortBy === 'priceLowToHigh') {
        q = query(q, orderBy('regularPrice', 'asc'));
      } else if (searchParams.sortBy === 'priceHighToLow') {
        q = query(q, orderBy('regularPrice', 'desc'));
      }

      // Fetch data
      const querySnapshot = await getDocs(q);
      const fetchedListings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setListings(fetchedListings);
    } catch (error) {
      setError('Failed to fetch listings.');
      console.error(error);
      handleAction()
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchParams]);

  return (

<div className="flex flex-col md:flex-row min-h-screen">
 
    {/* Filter Options */}
    <aside className="flex-1 bg-white shadow-md p-8 border-r md:w-1/4 h-fit rounded-lg max-w-fit">
      <h2 className="text-2xl font-semibold mb-4">Filter Options</h2>
      <div className="flex flex-col gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-gray-800 mb-2 font-semibold">Type</label>
          <div className="flex space-x-4">
            <button
              onClick={() => handleTypeSelect('rent')}
              className={`px-6 py-3 rounded-lg ${searchParams.type === 'rent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-700 transition-colors`}
            >
              Rent
            </button>
            <button
              onClick={() => handleTypeSelect('sale')}
              className={`px-6 py-3 rounded-lg ${searchParams.type === 'sale' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-700 transition-colors`}
            >
              Sale
            </button>
          </div>
        </div>

        {/* Manufacturer Input */}
        <div>
          <label className="block text-gray-800 mb-2 font-semibold" htmlFor="manufacturer">Manufacturer</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={searchParams.manufacturer}
            onChange={handleChange}
            placeholder="Manufacturer"
            className="p-3 border border-gray-300 rounded-lg w-full"
          />
        </div>

        {/* Min and Max Price Inputs in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-800 mb-2 font-semibold" htmlFor="minPrice">Min Price</label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={searchParams.minPrice}
              onChange={handleChange}
              placeholder="Min Price"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-gray-800 mb-2 font-semibold" htmlFor="maxPrice">Max Price</label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={searchParams.maxPrice}
              onChange={handleChange}
              placeholder="Max Price"
              className="p-3 border border-gray-300 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="block text-gray-800 mb-2 font-semibold" htmlFor="sortBy">Sort By Price</label>
          <select
            id="sortBy"
            name="sortBy"
            value={searchParams.sortBy}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg w-full"
          >
            <option value="priceLowToHigh">Low to High</option>
            <option value="priceHighToLow">High to Low</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </aside>

    {/* Listings Display */}
    <div className="flex-4 p-4">
    <h1 className="text-3xl text-center mt-0 font-bold mb-3">Search Listings</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : listings.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map(listing => (
            <ListingItem
              key={listing.id}
              id={listing.id}
              listing={listing}
            />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">No listings found.</p>
      )}
    </div>
  </div>
  );
};

export default SearchPage;
