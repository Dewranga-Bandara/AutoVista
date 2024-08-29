import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { useParams } from "react-router-dom";

// Define a type for route parameters that matches Record<string, string | undefined>
type Params = {
  categoryName?: string;
};

interface ListingData {
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

interface Listing {
  id: string;
  data: ListingData;
}

export default function Category() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFetchedListing, setLastFetchListing] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  
  // Use type casting for useParams
  const params = useParams() as Params;
  const categoryName = params.categoryName || '';

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("type", "==", categoryName),
          orderBy("timestamp", "desc"),
          limit(8)
        );
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        const fetchedListings: Listing[] = [];
        querySnap.forEach((doc) => {
          fetchedListings.push({
            id: doc.id,
            data: doc.data() as ListingData,
          });
        });
        setListings(fetchedListings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    }

    fetchListings();
  }, [categoryName]);

  async function onFetchMoreListings() {
    try {
      if (!lastFetchedListing) return;

      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("type", "==", categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4)
      );
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisible);
      const fetchedListings: Listing[] = [];
      querySnap.forEach((doc) => {
        fetchedListings.push({
          id: doc.id,
          data: doc.data() as ListingData,
        });
      });
      setListings((prevState) => prevState ? [...prevState, ...fetchedListings] : fetchedListings);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch more listings");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">
        {categoryName === "rent" ? "Vehicles for rent" : "Vehicles for sale"}
      </h1>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
          {lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button
                onClick={onFetchMoreListings}
                className="bg-white px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 hover:border-slate-600 rounded transition duration-150 ease-in-out"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <p>
          There are no current{" "}
          {params.categoryName === "rent"
            ? "vehicles for rent"
            : "vehicles for sale"}
        </p>
      )}
    </div>
  );
}
