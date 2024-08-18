import React from "react";
import Moment from "moment";
import { Link } from "react-router-dom";
import { MdCarRental } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

interface ListingItemProps {
  listing: {
    type: "sale" | "rent";
    name: string;
    manufacturer: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    description: string;
    offer: boolean;
    regularPrice: number;
    discountedPrice?: number;
    images: (File | string)[]; // Adjusted to accept both File and string
    timestamp?: any; // Ensure this is a valid Date or timestamp object
  };
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;

}

const ListingItem: React.FC<ListingItemProps> = ({ listing, id, onEdit, onDelete }) => {
  // Handle images - check if it's a File or a URL
  const imageUrl = listing.images.length > 0 
    ? (listing.images[0] instanceof File 
        ? URL.createObjectURL(listing.images[0]) 
        : listing.images[0])
    : "";

  // Convert timestamp to Date object if it is provided
  const timestamp = listing.timestamp
    ? new Date(listing.timestamp.seconds * 1000) // Adjust if necessary
    : null;

  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow duration-150 m-4">
      <Link className="contents" to={`/category/${listing.type}/${id}`}>
        <img
          className="h-[200px] w-full object-cover hover:scale-110 transition-transform duration-200 ease-in-out"
          loading="lazy"
          src={imageUrl}
          alt={listing.name}
        />
        {timestamp && (
          <div className="absolute top-2 left-2 bg-green-500 text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
            {Moment(timestamp).fromNow()}
          </div>
        )}
        {listing.offer && (
          <div className="absolute top-2 right-2 bg-red-500 text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
            Offer
          </div>
        )}
        <div className="w-full p-4">
          <div className="flex items-center space-x-2">
            <MdCarRental className="h-5 w-5 text-green-700" />
            <p className="font-semibold text-sm text-gray-700 truncate">
              {listing.manufacturer}
            </p>
          </div>
          <p className="font-semibold text-lg text-gray-800 truncate mt-2">
            {listing.name}
          </p>
          <p className="text-blue-600 mt-2 font-semibold text-lg">
            $
            {listing.offer
              ? listing.discountedPrice
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent"}
          </p>
          <div className="flex items-center mt-3 space-x-6 justify-between">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs text-gray-600">{listing.year}</p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs text-gray-600">
                {listing.transmission}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs text-gray-600">
                {listing.fuelType}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="w-full border-t border-gray-300 mb-2"></div>
      <div className="mt-7 p-1 flex flex-col justify-between h-full">
        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
          {onEdit && (
            <div
              className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors duration-200"
              onClick={() => onEdit(id)}
              aria-label="Edit Listing"
            >
              <MdEdit className="h-3 w-3" />
            </div>
          )}
          {onDelete && (
            <div
              className="flex items-center justify-center w-7 h-7 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-700 transition-colors duration-200"
              onClick={() => onDelete(id)}
              aria-label="Delete Listing"
            >
              <FaTrash className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ListingItem;
