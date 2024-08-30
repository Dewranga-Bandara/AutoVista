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
      <div className="relative flex flex-col md:flex-row lg:mx-auto p-8 rounded-lg shadow-lg bg-gradient-to-r lg:space-x-8 overflow-hidden">
        <div className="flex flex-col p-6 gap-8 sm:w-2/6">
          <h1 style={{ fontFamily: 'Fugaz One, sans-serif' }}  className='text-black font-bold text-4xl lg:text-7xl backdrop-blur-none'>
              Explore. <span className='text-green-600 text-4xl lg:text-7xl font-bold' style={{textShadow: '1px 1px 0 #ffffff, -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff'}}>
              Choose.
            </span> Drive.
            <br/>
          </h1>
          {/* <h1
  style={{ fontFamily: 'Fugaz One, sans-serif' }}
  className='text-black font-bold text-3xl lg:text-4xl backdrop-blur-none'
>
  <h1
  style={{ fontFamily: 'Fugaz One, sans-serif' }}
  className='text-black font-bold text-3xl lg:text-4xl backdrop-blur-none'
>
🚗&nbsp;&nbsp;&nbsp;&nbsp;🔍&nbsp;&nbsp;&nbsp;&nbsp;🚙💨
</h1>

</h1> */}

<p className="text-slate-600 text-sm font-medium sm:text-base leading-tight relative z-20">
  Welcome to Autovista! Discover your new vehicle with us, whether buying or renting, we have a great selection for you. Explore and find what suits you best!
</p>

          <a 
              href='/search' 
              className='bg-blue-500 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-600 transition w-fit justify-end'>
              Start Your Journey 
          </a>
      </div>
      <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden sm:w-4/6">
          <Swiper
            slidesPerView={1}
            pagination={{ clickable: true }}
            effect="fade"
            modules={[EffectFade, Autoplay, Pagination]}
            autoplay={{ delay: 5000 }}
            className="relative w-full h-fit"
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
                  className="relative w-full h-[500px] bg-gray-300"
                >
                  {data.images.length === 0 && (
                    <p className="absolute inset-0 flex items-center justify-center text-white bg-gray-800 bg-opacity-60 text-lg">
                      No Image Available
                    </p>
                  )}
                </div>
                <p className="absolute bottom-4 left-4 text-white font-bold bg-[#1aa43d] px-3 py-1 rounded-lg shadow-md">
                  {data.name}
                </p>
                <p className="absolute bottom-4 right-4 text-white font-semibold bg-[#e63946] px-3 py-1 rounded-lg shadow-md">
                  ${data.regularPrice}
                  {data.type === "rent" && " / month"}
                </p>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
  );
}
