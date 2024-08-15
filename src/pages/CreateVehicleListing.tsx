import { useState, ChangeEvent, FormEvent } from "react";
import Select, { SingleValue, ActionMeta } from "react-select";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuid4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // Ensure firebase is initialized here
import { useNavigate } from "react-router-dom";

interface FormData {
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
  images: File[];
}

interface Errors {
  [key: string]: string;
}

const fuelTypeOptions = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" },
];

const transmissionOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

export default function CreateVehicleListing() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
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
  });

  const [errors, setErrors] = useState<Errors>({});

  const {
    type,
    name,
    manufacturer,
    model,
    year,
    mileage,
    fuelType,
    transmission,
    description,
    offer,
    regularPrice,
    discountedPrice,
    images,
  } = formData;

  function onChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    const { id, type, value, files, checked } = e.target as HTMLInputElement;

    if (type === "file" && files) {
      if (files.length > 6) {
        toast.error("You can upload a maximum of 6 images.");
        return;
      }

      const fileArray = Array.from(files);

      setFormData((prev) => ({
        ...prev,
        [id]: fileArray, // Set the selected images
      }));

    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "checkbox" ? checked : value,
      }));
    }

    validateField(id, type, value);
  }

  function validateField(id: string, type: string, value: string) {
    switch (id) {
      case "fuelType":
        setErrors((prev) => ({
          ...prev,
          fuelType: !value ? "Fuel type is required." : "",
        }));
        break;
      case "transmission":
        setErrors((prev) => ({
          ...prev,
          transmission: !value ? "Transmission is required." : "",
        }));
        break;
      case "name":
        setErrors((prev) => ({
          ...prev,
          name: !value ? "Vehicle name is required." : "",
        }));
        break;
      case "manufacturer":
        setErrors((prev) => ({
          ...prev,
          manufacturer: !value ? "Manufacturer is required." : "",
        }));
        break;
      case "model":
        setErrors((prev) => ({
          ...prev,
          model: !value ? "Model is required." : "",
        }));
        break;
      case "year":
        const yearValue = parseInt(value);
        setErrors((prev) => ({
          ...prev,
          year:
            isNaN(yearValue) || yearValue < 1886 || yearValue > new Date().getFullYear()
              ? "Invalid year."
              : "",
        }));
        break;
      case "mileage":
        const mileageValue = parseFloat(value);
        setErrors((prev) => ({
          ...prev,
          mileage: isNaN(mileageValue) || mileageValue < 0 ? "Invalid mileage." : "",
        }));
        break;
      case "description":
        setErrors((prev) => ({
          ...prev,
          description: !value ? "Description is required." : "",
        }));
        break;
      case "regularPrice":
        const regularPriceValue = parseFloat(value);
        setErrors((prev) => ({
          ...prev,
          regularPrice:
            isNaN(regularPriceValue) || regularPriceValue <= 0
              ? "Price must be greater than 0."
              : "",
        }));
        break;
      case "discountedPrice":
        if (offer) {
          const discountedPriceValue = parseFloat(value);
          setErrors((prev) => ({
            ...prev,
            discountedPrice:
              isNaN(discountedPriceValue) || discountedPriceValue - regularPrice >= 0
                ? "Discounted price must be less than regular price."
                : "",
          }));
        }
        break;
      default:
        break;
    }
  }

  function handleSelectChange(
    selectedOption: SingleValue<{ value: string; label: string }>,
    actionMeta: ActionMeta<{ value: string; label: string }>
  ) {
    const value = selectedOption ? selectedOption.value : "";
    const name = actionMeta.name as string;

    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      validateField(name, "text", value);
    }
  }

  function validateForm(): boolean {
    const newErrors: Errors = {};

    if (!name) newErrors.name = "Vehicle name is required.";
    if (!manufacturer) newErrors.manufacturer = "Manufacturer is required.";
    if (!model) newErrors.model = "Model is required.";
    if (!year || year < 1886 || year > new Date().getFullYear())
      newErrors.year = "Invalid year.";
    if (!mileage || mileage < 0) newErrors.mileage = "Invalid mileage.";
    if (!fuelType) newErrors.fuelType = "Fuel type is required.";
    if (!transmission) newErrors.transmission = "Transmission is required.";
    if (!description) newErrors.description = "Description is required.";
    if (regularPrice <= 0)
      newErrors.regularPrice = "Price must be greater than 0.";
    if (
      offer &&
      discountedPrice !== undefined &&
      discountedPrice - regularPrice >= 0
    )
      newErrors.discountedPrice =
        "Discounted price must be less than regular price.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function storeImage(image: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser?.uid}-${image.name}-${uuid4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }

  // Handle form submission
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    if (images.length > 7) {
      toast.error("Maximum 6 images are allowed");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to create a listing.");
      return;
    }

    setLoading(true);

    try {
      // Upload images and get URLs
      const imgUrls = await Promise.all(images.map((image) => storeImage(image)));

      // Prepare form data for Firestore
      const formDataCopy: any = {
        ...formData,
        mileage: Number(formData.mileage), // Ensure mileage is a number
        regularPrice: Number(formData.regularPrice), // Ensure regularPrice is a number
        images: imgUrls, // Array of image URLs
        userRef: user.uid, // User reference (ensure uid is correct)
      };

      // Conditionally add discountedPrice only if offer is true
      if (formData.offer) {
        formDataCopy.discountedPrice = Number(formData.discountedPrice);
      }

      delete formDataCopy.offer; // Remove offer if not needed in the Firestore document


      console.log(formDataCopy)

      setLoading(false);

      // Add document to Firestore
      const docRef = await addDoc(collection(db, "listings"), {
        ...formDataCopy,
        timestamp: serverTimestamp(), // Add a timestamp field
      });
      toast.success("Listing created");
      navigate(`/category/${formDataCopy.type}/${docRef.id}`);
    } catch (error) {
      console.error("Error creating listing: ", error);
      toast.error("Failed to create listing: " + error);
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveImage = (index: number) => {
    const imgUrls = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: imgUrls,
    });
  };
  

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
  <h1 className="text-2xl mb-4 text-center font-bold">Create Vehicle Listing</h1>
  <div style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
  <div style={{ flex: 1, marginRight: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
  <form onSubmit={handleSubmit}>
    <label className="block text-xl font-semibold text-gray-800 mb-6 text-center">
      Choose
    </label>
    <div className="flex mb-6 justify-between">
      <button
        type="button"
        id="rent"
        className={`py-3 px-5 mr-4 rounded-lg transition-transform transform hover:scale-105 ${
          type === "rent" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-200"
        }`}
        onClick={() => setFormData((prev) => ({ ...prev, type: "rent" }))}
      >
        Rent
      </button>
      <button
        type="button"
        id="sale"
        className={`py-3 px-5 rounded-lg transition-transform transform hover:scale-105 ${
          type === "sale" ? "bg-blue-500 text-white shadow-lg" : "bg-gray-200"
        }`}
        onClick={() => setFormData((prev) => ({ ...prev, type: "sale" }))}
      >
        Sale
      </button>
    </div>

    <input
      type="text"
      id="name"
      value={name}
      onChange={onChange}
      placeholder="Vehicle Name"
      className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
    {errors.name && <p className="text-red-500 mb-4">{errors.name}</p>}

    <div className="flex justify-between gap-4">
      <input
        type="text"
        id="manufacturer"
        value={manufacturer}
        onChange={onChange}
        placeholder="Manufacturer"
        className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.manufacturer && <p className="text-red-500 mb-4">{errors.manufacturer}</p>}

      <input
        type="text"
        id="model"
        value={model}
        onChange={onChange}
        placeholder="Model"
        className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.model && <p className="text-red-500 mb-4">{errors.model}</p>}
    </div>

    <div className="flex justify-between gap-4">
      <input
        type="number"
        id="year"
        value={year}
        onChange={onChange}
        placeholder="Year"
        className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.year && <p className="text-red-500 mb-4">{errors.year}</p>}

      <input
        type="number"
        id="mileage"
        value={mileage}
        onChange={onChange}
        placeholder="Mileage"
        className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.mileage && <p className="text-red-500 mb-4">{errors.mileage}</p>}
    </div>

    <div className="flex justify-between gap-4">
      <Select
        name="fuelType"
        options={fuelTypeOptions}
        onChange={handleSelectChange}
        value={fuelTypeOptions.find((option) => option.value === fuelType)}
        placeholder="Fuel Type"
        className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.fuelType && <p className="text-red-500 mb-4">{errors.fuelType}</p>}

      <Select
        name="transmission"
        options={transmissionOptions}
        onChange={handleSelectChange}
        value={transmissionOptions.find((option) => option.value === transmission)}
        placeholder="Transmission"
        className="border p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {errors.transmission && <p className="text-red-500 mb-4">{errors.transmission}</p>}
    </div>

    <textarea
      id="description"
      value={description}
      onChange={onChange}
      placeholder="Description"
      className="border p-3 mt-4 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
    {errors.description && <p className="text-red-500 mb-4">{errors.description}</p>}

    <input
      type="number"
      id="regularPrice"
      value={regularPrice}
      onChange={onChange}
      placeholder="Regular Price"
      className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
    {errors.regularPrice && <p className="text-red-500 mb-4">{errors.regularPrice}</p>}

    <label className="flex items-center mb-4">
      <input
        type="checkbox"
        id="offer"
        checked={offer}
        onChange={onChange}
        className="mr-2 focus:ring-2 focus:ring-blue-300"
      />
      Special Offer
    </label>

    {offer && (
      <input
        type="number"
        id="discountedPrice"
        value={discountedPrice}
        onChange={onChange}
        placeholder="Discounted Price"
        className="border p-3 mb-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    )}
    {offer && errors.discountedPrice && (
      <p className="text-red-500 mb-4">{errors.discountedPrice}</p>
    )}

    <button
      type="submit"
      className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105"
    >
      Create Listing
    </button>
  </form>
</div>


    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
  <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <label htmlFor="images">
        <input
          type="file"
          id="images"
          multiple
          onChange={onChange}
          className="hidden"
        />
        <div
          className="cursor-pointer px-4 py-2 bg-gradient-to-r from-lime-400 to-lime-600 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Upload Images
        </div>
      </label>
    </div>
    <button
      onClick={handleSubmit}
      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg transition-transform transform hover:scale-105"
    >
      Create Listing
    </button>
  </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {formData.images.length > 0 &&
        formData.images.map((file, index) => (
          <div
            key={index} // Using index as key
            className="flex justify-between p-4 border border-gray-200 items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={URL.createObjectURL(file)} // Convert file to a URL for display
              alt="listing image"
              className="w-24 h-24 object-cover rounded-lg border-2 border-gray-100"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="p-2 text-red-600 rounded-lg bg-gray-100 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</main>

  );
}
