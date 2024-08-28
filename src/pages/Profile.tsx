import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import ListingItem from "../components/ListingItem";

import ConfirmDeleteModal from "../components/ConfirmDeleteModal";


interface FormData {
  name: string;
  email: string;
}

interface Listing {
  id: string;
  data: any; // Define the specific type for your listing data if possible
}


export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  

    // First useEffect: Handles user authentication and setting form data
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          setFormData({
            name: user.displayName || '',
            email: user.email || '',
          });
        }
      });
  
      return () => unsubscribe();
    }, [auth]);
  
    // Second useEffect: Handles fetching user listings based on the authenticated user
    useEffect(() => {
      async function fetchUserListings() {
        if (auth.currentUser) {
          const listingRef = collection(db, 'listings');
          const q = query(
            listingRef,
            where('userRef', '==', auth.currentUser.uid),
            orderBy('timestamp', 'desc')
          );
          const querySnap = await getDocs(q);
          let fetchedListings: Listing[] = [];
          querySnap.forEach((doc) => {
            fetchedListings.push({
              id: doc.id,
              data: doc.data(),
            });
          });
          setListings(fetchedListings);
          setLoading(false);
        }
      }
  
      fetchUserListings();
    }, [auth.currentUser?.uid]);

  function onLogout() {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  }

  function toggleEdit() {
    setIsEditing((prev) => !prev);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  async function checkNameUniqueness(name: string, excludeUserId?: string) {
    const q = query(collection(db, "users"), where("name", "==", name));
    const querySnapshot = await getDocs(q);

    // If there's a document and it's not the current user, the name is taken
    return !querySnapshot.empty && querySnapshot.docs.every(doc => doc.id !== excludeUserId);
  }

  async function validateForm() {
    const { name, email } = formData;
    const newErrors: { name?: string; email?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (await checkNameUniqueness(name.trim(), auth.currentUser?.uid)) {
      newErrors.name = "Name is already in use.";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      newErrors.email = "Invalid email format.";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      if (newErrors.name) {
        toast.error(newErrors.name);
      }
      if (newErrors.email) {
        toast.error(newErrors.email);
      }
    }
    return isValid;
  }

  async function onSubmit() {
    if (!await validateForm()) {
      return;
    }

    try {
      const { name } = formData;
      const currentUser = auth.currentUser;

      if (currentUser) {
        if (currentUser.displayName !== name) {
          if (await checkNameUniqueness(name.trim(), currentUser.uid)) {
            toast.error("Name is already in use.");
            return;
          }

          // Update display name in Firebase Auth
          await updateProfile(currentUser, {
            displayName: name,
          });

          // Update name in Firestore
          const docRef = doc(db, "users", currentUser.uid);
          await updateDoc(docRef, {
            name,
          });
        }
        toast.success("Profile details updated");
      }
    } catch (error) {
      toast.error("Could not update the profile details");
    }
  }

  const onDelete = async (listingID: string) => {
    if (listingToDelete !== listingID) {
      setListingToDelete(listingID);
      setModalIsOpen(true);
      return;
    }

    try {
      await deleteDoc(doc(db, "listings", listingID));
      const updatedListings = listings.filter((listing) => listing.id !== listingID);
      setListings(updatedListings);
      toast.success("Successfully deleted the listing");
    } catch (error) {
      toast.error("Failed to delete the listing");
      console.error("Error deleting listing:", error);
    }
    setModalIsOpen(false);
    setListingToDelete(null);
  };

  const onEdit = (listingID: string) => {
    navigate(`/edit-listing/${listingID}`);
  };

  const onCreateListing = () => {
    navigate(`/create-listing`);
  };

  return (
    <>
    <section className="mt-4 max-w-6xl mx-auto flex justify-center items-center flex-col p-6">
  <h1 className="text-3xl text-center mt-0 font-bold mb-3">Profile</h1>
  <div className="w-full md:w-[50%] mt-6 px-4 py-6 bg-white rounded-lg shadow-md">
    <form>
      {/* Name Input */}
      <div className="mb-6">
        <label htmlFor="name" className="block text-lg font-semibold text-gray-700 mb-2">Username</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={onChange}
          disabled={!isEditing}
          className={`w-full px-4 py-3 text-lg text-gray-900 bg-gray-100 border border-gray-300 rounded-lg transition ease-in-out focus:ring-2 ${
            isEditing ? "bg-red-50 ring-red-300" : "focus:ring-blue-300"
          }`}
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email Input */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-2">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={onChange}
          disabled={!isEditing}
          className="w-full px-4 py-3 text-lg text-gray-900 bg-gray-100 border border-gray-300 rounded-lg transition ease-in-out focus:ring-2 focus:ring-blue-300"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="flex justify-between items-center text-sm sm:text-base mb-6">
        <p className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <span
                onClick={async () => {
                  await onSubmit();
                  toggleEdit();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition ease-in-out cursor-pointer"
              >
                Save
              </span>
              <span
                onClick={toggleEdit}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition ease-in-out cursor-pointer"
              >
                Cancel
              </span>
            </>
          ) : (
            <>
              <span>Do you want to change your name?</span>
              <span
                onClick={toggleEdit}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition ease-in-out cursor-pointer"
              >
                Edit
              </span>
            </>
          )}
        </p>
        <button
          onClick={onLogout}
          className="ml-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition ease-in-out cursor-pointer"
          aria-label="Sign out"
        >
          Sign out
        </button>

      </div>
      <button
            onClick={() => onCreateListing()}
            className="justify-center items-center cursor-pointer bg-gradient-to-r from-blue-500 to-blue-700 text-white w-full py-2 font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-800"
            >
            Create new listing
        </button>
    </form>
  </div>
</section>

      <div className="max-w-6xl px-3 mt-6 mx-auto">
      {!loading && listings.length > 0 && (
        <>
           <h2 className="text-3xl text-center mt-0 font-bold mb-3">
              Your Listings
            </h2>
            <ul className="sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingItem
                key={listing.id}
                id={listing.id}
                listing={listing.data}
                onDelete={() => {
                  setListingToDelete(listing.id);
                  setModalIsOpen(true);
                }}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </>
      )}
    </div>
    {modalIsOpen && (
        <ConfirmDeleteModal
          onConfirm={() => listingToDelete && onDelete(listingToDelete)}
          onCancel={() => setModalIsOpen(false)}
        />
      )}
    </>
  );
}
