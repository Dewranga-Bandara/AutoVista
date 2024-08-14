import { useState, ChangeEvent, FormEvent } from "react";
import Select from "react-select";

interface FormData {
  type: "sale" | "rent";
  name: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  description: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
  images: File[];
}

interface Errors {
  [key: string]: string;
}

// Auto-suggestion options
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
  const [formData, setFormData] = useState<FormData>({
    type: "rent",
    name: "",
    make: "",
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
    make,
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

  function onChange(e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) {
    const { id, type, value, files, checked } = e.target as HTMLInputElement;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : type === "file" ? (files ? Array.from(files) : []) : value,
    }));

    // Validate input and update errors
    switch (id) {
      case "name":
        if (!value) {
          setErrors((prev) => ({ ...prev, name: "Vehicle name is required." }));
        } else {
          setErrors((prev) => ({ ...prev, name: "" }));
        }
        break;
      case "make":
        if (!value) {
          setErrors((prev) => ({ ...prev, make: "Make is required." }));
        } else {
          setErrors((prev) => ({ ...prev, make: "" }));
        }
        break;
      case "model":
        if (!value) {
          setErrors((prev) => ({ ...prev, model: "Model is required." }));
        } else {
          setErrors((prev) => ({ ...prev, model: "" }));
        }
        break;
      case "year":
        const yearValue = parseInt(value);
        if (isNaN(yearValue) || yearValue < 1886 || yearValue > new Date().getFullYear()) {
          setErrors((prev) => ({ ...prev, year: "Invalid year." }));
        } else {
          setErrors((prev) => ({ ...prev, year: "" }));
        }
        break;
      case "mileage":
        const mileageValue = parseFloat(value);
        if (isNaN(mileageValue) || mileageValue < 0) {
          setErrors((prev) => ({ ...prev, mileage: "Invalid mileage." }));
        } else {
          setErrors((prev) => ({ ...prev, mileage: "" }));
        }
        break;
      case "description":
        if (!value) {
          setErrors((prev) => ({ ...prev, description: "Description is required." }));
        } else {
          setErrors((prev) => ({ ...prev, description: "" }));
        }
        break;
      case "regularPrice":
        const regularPriceValue = parseFloat(value);
        if (isNaN(regularPriceValue) || regularPriceValue <= 0) {
          setErrors((prev) => ({ ...prev, regularPrice: "Price must be greater than 0." }));
        } else {
          setErrors((prev) => ({ ...prev, regularPrice: "" }));
        }
        break;
      case "discountedPrice":
        if (offer) {
          const discountedPriceValue = parseFloat(value);
          if (isNaN(discountedPriceValue) || discountedPriceValue >= regularPrice) {
            setErrors((prev) => ({ ...prev, discountedPrice: "Discounted price must be less than regular price." }));
          } else {
            setErrors((prev) => ({ ...prev, discountedPrice: "" }));
          }
        }
        break;
      default:
        break;
    }
  }

  function handleSelectChange(selectedOption: any, { name }: { name: string }) {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  }

  function validateForm(): boolean {
    const newErrors: Errors = {};

    if (!name) newErrors.name = "Vehicle name is required.";
    if (!make) newErrors.make = "Make is required.";
    if (!model) newErrors.model = "Model is required.";
    if (!year || year < 1886 || year > new Date().getFullYear()) newErrors.year = "Invalid year.";
    if (!mileage || mileage < 0) newErrors.mileage = "Invalid mileage.";
    if (!fuelType) newErrors.fuelType = "Fuel type is required.";
    if (!transmission) newErrors.transmission = "Transmission is required.";
    if (!description) newErrors.description = "Description is required.";
    if (regularPrice <= 0) newErrors.regularPrice = "Price must be greater than 0.";
    if (offer && discountedPrice >= regularPrice) newErrors.discountedPrice = "Discounted price must be less than regular price.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      // Submit form data
    }
  }

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Create a Vehicle Listing</h1>
      <form onSubmit={handleSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={() => setFormData({ ...formData, type: "sale" })}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent" ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={() => setFormData({ ...formData, type: "rent" })}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "sale" ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Rent
          </button>
        </div>

        {/* Vehicle Name */}
        <p className="text-lg mt-6 font-semibold">Vehicle Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Vehicle Name"
          maxLength={32}
          minLength={2}
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}

        {/* Make and Model */}
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Make</p>
            <input
              type="text"
              id="make"
              value={make}
              onChange={onChange}
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />
            {errors.make && <p className="text-red-500">{errors.make}</p>}
          </div>
          <div>
            <p className="text-lg font-semibold">Model</p>
            <input
              type="text"
              id="model"
              value={model}
              onChange={onChange}
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />
            {errors.model && <p className="text-red-500">{errors.model}</p>}
          </div>
        </div>

        {/* Year */}
        <p className="text-lg mt-6 font-semibold">Year</p>
        <input
          type="number"
          id="year"
          value={year}
          onChange={onChange}
          min="1886"
          max={new Date().getFullYear()}
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {errors.year && <p className="text-red-500">{errors.year}</p>}

        {/* Mileage */}
        <p className="text-lg mt-6 font-semibold">Mileage (km)</p>
        <input
          type="number"
          id="mileage"
          value={mileage}
          onChange={onChange}
          min="0"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {errors.mileage && <p className="text-red-500">{errors.mileage}</p>}

        {/* Fuel Type */}
        <p className="text-lg mt-6 font-semibold">Fuel Type</p>
        <Select
          id="fuelType"
          name="fuelType"
          value={fuelTypeOptions.find((option) => option.value === fuelType) || null}
          onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "fuelType" })}
          options={fuelTypeOptions}
          placeholder="Select Fuel Type"
          className="mb-6"
        />
        {errors.fuelType && <p className="text-red-500">{errors.fuelType}</p>}

        {/* Transmission */}
        <p className="text-lg mt-6 font-semibold">Transmission</p>
        <Select
          id="transmission"
          name="transmission"
          value={transmissionOptions.find((option) => option.value === transmission) || null}
          onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "transmission" })}
          options={transmissionOptions}
          placeholder="Select Transmission"
          className="mb-6"
        />
        {errors.transmission && <p className="text-red-500">{errors.transmission}</p>}

        {/* Description */}
        <p className="text-lg mt-6 font-semibold">Description</p>
        <textarea
          id="description"
          value={description}
          onChange={onChange}
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}

        {/* Offer */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="offer"
            checked={offer}
            onChange={onChange}
            className="mr-2"
          />
          <label htmlFor="offer" className="text-lg font-semibold">Special Offer</label>
        </div>

        {/* Prices */}
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="text-lg font-semibold">Regular Price (LKR)</p>
            <input
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onChange}
              min="1"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
            />
            {errors.regularPrice && <p className="text-red-500">{errors.regularPrice}</p>}
          </div>
          {offer && (
            <div className="mb-6">
              <p className="text-lg font-semibold">Discounted Price (LKR)</p>
              <input
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onChange}
                min="1"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
              />
              {errors.discountedPrice && <p className="text-red-500">{errors.discountedPrice}</p>}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="mb-6">
          <p className="text-lg font-semibold">Upload Images</p>
          <input
            type="file"
            id="images"
            multiple
            onChange={onChange}
            className="w-full text-gray-700 border border-gray-300 rounded transition duration-150 ease-in-out focus:border-slate-600"
          />
        </div>

        <button
          type="submit"
          className="w-full px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 transition duration-150 ease-in-out"
        >
          Create Listing
        </button>
      </form>
    </main>
  );
}
