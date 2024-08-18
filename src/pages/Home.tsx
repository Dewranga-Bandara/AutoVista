import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import Slider from "../components/Slider";
import { db } from "../firebase";

interface ListingData {
  id: string;
  data: { type: "rent" | "sale"; name: string; manufacturer: string; model: string; year: number; mileage: number; fuelType: string; transmission: string; description: string; offer: boolean; regularPrice: number; discountedPrice?: number | undefined; images: (string | File)[]; timestamp?: any; };
  type: "rent" | "sale";
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
  images: (string | File)[];
  timestamp?: any; // Adjust based on your timestamp field
}

const Home: React.FC = () => {
  const [offerListings, setOfferListings] = useState<ListingData[] | null>(null);
  const [rentListings, setRentListings] = useState<ListingData[] | null>(null);
  const [saleListings, setSaleListings] = useState<ListingData[] | null>(null);

  useEffect(() => {
    async function fetchOfferListings() {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        const querySnap = await getDocs(q);
        const listings: ListingData[] = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data() as ListingData,
            type: "rent",
            name: "",
            manufacturer: "",
            model: "",
            year: 0,
            mileage: 0,
            fuelType: "",
            transmission: "",
            description: "",
            offer: false,
            regularPrice: 0,
            images: []
          });
        });
        setOfferListings(listings);
      } catch (error) {
        console.error(error);
      }
    }
    fetchOfferListings();
  }, []);

  useEffect(() => {
    async function fetchRentListings() {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("type", "==", "rent"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        const querySnap = await getDocs(q);
        const listings: ListingData[] = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data() as ListingData,
            type: "rent",
            name: "",
            manufacturer: "",
            model: "",
            year: 0,
            mileage: 0,
            fuelType: "",
            transmission: "",
            description: "",
            offer: false,
            regularPrice: 0,
            images: []
          });
        });
        setRentListings(listings);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRentListings();
  }, []);

  useEffect(() => {
    async function fetchSaleListings() {
      try {
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("type", "==", "sale"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        const querySnap = await getDocs(q);
        const listings: ListingData[] = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data() as ListingData,
            type: "sale",
            name: "",
            manufacturer: "",
            model: "",
            year: 0,
            mileage: 0,
            fuelType: "",
            transmission: "",
            description: "",
            offer: false,
            regularPrice: 0,
            images: []
          });
        });
        setSaleListings(listings);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSaleListings();
  }, []);

  return (
    <div>
      <Slider />
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent offers</h2>
            <Link to="/offers">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Vehicles for rent</h2>
            <Link to="/category/rent">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more vehicles for rent
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Vehicles for sale</h2>
            <Link to="/category/sale">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more vehicles for sale
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
