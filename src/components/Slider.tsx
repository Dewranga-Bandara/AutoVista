import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import { useNavigate } from "react-router-dom";

// Define the types for listing data
interface ListingData {
  id: string;
  data: {
    name: string;
    images: string[]; // Ensure this is always an array
    discountedPrice?: number;
    regularPrice: number;
    type: "sale" | "rent";
    timestamp: any;
  };
}

export default function Slider() {
  const [listings, setListings] = useState<ListingData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  SwiperCore.use([Autoplay, Navigation, Pagination]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchListings() {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);
      let fetchedListings: ListingData[] = [];
      querySnap.forEach((doc) => {
        const data = doc.data() as {
          name: string;
          images?: string[]; // Make images optional here
          discountedPrice?: number;
          regularPrice: number;
          type: "sale" | "rent";
          timestamp: any;
        };
        fetchedListings.push({
          id: doc.id,
          data: {
            ...data,
            images: data.images ?? [], // Provide a default value for images
          },
        });
      });
      setListings(fetchedListings);
      setLoading(false);
    }
    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings === null || listings.length === 0) {
    return null;
  }

  return (
    <>
      <Swiper
        slidesPerView={1}
        pagination={{ clickable: true }}
        effect="fade"
        modules={[EffectFade]}
        autoplay={{ delay: 3000 }}
        className="relative w-full h-full overflow-hidden"
      >
        {listings.map(({ data, id }) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${data.type}/${id}`)}
          >
            <div
              style={{
                background: data.images.length > 0 
                  ? `url(${data.images[0]}) center no-repeat`
                  : "none", // Fallback if images is empty
                backgroundSize: "cover",
              }}
              className="relative w-full h-[340px] overflow-hidden"
            >
              {/* Optionally show a placeholder or text if no image */}
              {data.images.length === 0 && (
                <p className="absolute inset-0 flex items-center justify-center text-white bg-gray-800 bg-opacity-60">
                  No Image Available
                </p>
              )}
            </div>
            <p className="text-[#f1faee] absolute left-1 top-3 font-medium max-w-[90%] bg-[#1aa43d] shadow-lg opacity-90 p-2 rounded-br-2xl">
              {data.name}
            </p>
            <p className="text-[#f1faee] absolute left-1 bottom-1 font-semibold max-w-[90%] bg-[#e63946] shadow-lg opacity-90 p-2 rounded-tr-2xl">
              ${data.regularPrice}
              {data.type === "rent" && " / month"}
            </p>

          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
