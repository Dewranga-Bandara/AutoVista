import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css/bundle";
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";

import { MdCalendarToday, MdCarCrash, MdCarRental, MdCarRepair, MdCopyAll, MdInsertLink, MdLink, MdLinkOff, MdLocalGasStation, MdSafetyCheck, MdShare, MdSpeed } from "react-icons/md";

SwiperCore.use([EffectFade, Autoplay, Navigation, Pagination]);

interface ListingData {
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
    discountedPrice: number;
    images: string[];
    userRef: string;  // User reference (user ID)
}

export default function Listing() {
  const auth = getAuth();
  const params = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<ListingData>(
    {
    type: "rent",
    name: "",
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    fuelType: "",
    transmission: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: [],
    userRef:"",
    }
  );
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [contactOwner, setContactOwner] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      if (params.listingId) {
        const docRef = doc(db, "listings", params.listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ListingData;
          console.log("Fetched listing data:", data); // Debugging: check the structure of the fetched data
          setListing(data);
        } else {
          console.error("No such document!");
        }
        setLoading(false);
      }
    }
    fetchListing();
  }, [params.listingId]);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 2000);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="bg-gray-50 min-h-screen py-7 overflow-y-hidden">

  <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-6 rounded-lg shadow-xl bg-white lg:space-x-8 overflow-y-hidden ">
    <div className="mt-6 w-full h-[200px] lg:h-[400px] bg-gray-200 rounded-lg overflow-y-hidden justify-center items-center">
    {/* Swiper Component for Image Carousel */}
    {listing.images && listing.images.length > 0 ? (
            <Swiper
            slidesPerView={1}
      pagination={{ clickable: true }}
      effect="fade"
      modules={[EffectFade]}
      autoplay={{ delay: 3000 }}
      className="relative w-full h-full overflow-hidden"
            >
              {listing.images.map((url, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="relative w-full overflow-hidden h-[400px] lg:h-[500px] rounded-lg shadow-lg cursor-zoom-in"
                    onClick={() => handleImageClick(url)}
                    style={{
                      background: `url(${url}) center no-repeat`,
                      backgroundSize: "cover",
                    }}
                  ></div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center text-gray-500">No images available.</p>
          )}

          {/* Full-Screen Modal for Image Viewing */}
          {isModalOpen && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="relative max-w-full max-h-full">
                <img src={selectedImage} alt="Full screen view" className="w-full h-auto object-contain" />
                <button
                  className="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 rounded-full p-2"
                  onClick={closeModal}
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          {/* Share Button */}
          <div
            className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
            onClick={handleShareClick}
          >
            <MdShare className="text-lg text-slate-500" />
          </div>
          {shareLinkCopied && (
            <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2">
              Link Copied
            </p>
          )}

    </div>

    <div className="w-full flex flex-col justify-between">
      <div className="mb-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          {listing.name}
        </h1>
        
        <div className="text-2xl mt-6 flex items-center space-x-4">
  {listing.offer && (
    <>
      <span className="text-blue-500 line-through text-lg">
        ${listing.regularPrice
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </span>
      <span className="text-red-600 font-bold">
        ${(
          +listing.regularPrice - +listing.discountedPrice
        ).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </span>
      <p className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg ml-4">
        ${listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Off
      </p>
    </>
  )}
  {!listing.offer && (
    <span className="text-red-600 font-bold">
      ${listing.regularPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
    </span>
  )}
</div>


<div className="flex justify-between items-center space-x-4 w-full mt-7">
        <p className="cursor-pointer bg-gradient-to-r from-green-500 to-green-700 text-white px-16 py-2 font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-800">
          {listing.type === "rent" ? "Rent" : "Sale"}
        </p>

        {listing.userRef === auth.currentUser?.uid && !contactOwner && (
        <div>
            <button
            onClick={() => setContactOwner(true)}
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white px-16 py-2 font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800"
            >
            Contact Owner
            </button>
        </div>
        )}
        {contactOwner && (
            <Contact userRef={listing.userRef} listing={listing} />
        )}
        
      </div>

      </div>

      <p className="mt-3 text-base text-gray-800 leading-relaxed">
        <span className="font-normal">{listing.description}</span> 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 mb-2">
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdCarRental className="text-green-600 mr-3" />
            <span>{listing.manufacturer}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdCarRental className="text-green-600 mr-3" />
            <span>{listing.model}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdSpeed className="text-green-600 mr-3" />
            <span>{listing.mileage} miles</span>
        </div>
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdCalendarToday className="text-green-600 mr-3" />
            <span>{listing.year}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdLocalGasStation className="text-green-600 mr-3" />
            <span>{listing.fuelType}</span>
        </div>
        <div className="flex items-center text-lg font-bold text-gray-700">
            <MdCarRepair className="text-green-600 mr-3" />
            <span>{listing.transmission}</span>
        </div>
       </div>
    </div>
  </div>
</main>
  );
}
