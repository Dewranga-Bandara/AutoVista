import { useState, ChangeEvent, FormEvent } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormDataWithoutPassword extends Omit<FormData, "password"> {
  timestamp: any;
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const { name, email, password } = formData;
  const navigate = useNavigate();

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation: Check if name, email, and password are provided
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    try {
      // Check if the name is already in use
      const usersCollectionRef = collection(db, "users");
      const nameQuery = query(usersCollectionRef, where("name", "==", name));
      const nameQuerySnapshot = await getDocs(nameQuery);

      if (!nameQuerySnapshot.empty) {
        toast.error("This name is already in use. Please choose a different name.");
        return;
      }

      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
      } else {
        toast.error("Failed to update profile: User not authenticated.");
        return;
      }

      const user = userCredential.user;

      // Create a copy of formData without password and add timestamp
      const formDataCopy: FormDataWithoutPassword = {
        ...formData,
        timestamp: serverTimestamp(),
      };

      // Remove password from the copy
      delete (formDataCopy as any).password;

      await setDoc(doc(db, "users", user.uid), formDataCopy);
      toast.success("Sign up was successful");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("email-already-in-use")) {
          toast.error("This email address is already in use. Please use a different email.");
        } else {
          toast.error(error.message || "Something went wrong with the registration");
        }
      } else {
        toast.error("An unknown error occurred");
      }
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-6 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
          <label className="block text-gray-800 mb-1 font-semibold">Username</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={onChange}
              placeholder="eg: user"
              className="mb-3 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <label className="block text-gray-800 mb-1 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="eg: user@gmail.com"
              className="mb-3 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <div className="relative mb-6">
      <label className="block text-gray-800 mb-1 font-semibold">Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          value={password}
          onChange={onChange}
          placeholder="eg: .............."
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out pr-12"
        />
        {showPassword ? (
          <AiFillEyeInvisible
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer"
            onClick={() => setShowPassword((prevState) => !prevState)}
          />
        ) : (
          <AiFillEye
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl cursor-pointer"
            onClick={() => setShowPassword((prevState) => !prevState)}
          />
        )}
      </div>
    </div>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p className="mb-6">
                Have an account?
                <Link
                  to="/sign-in"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Sign in
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
            >
              Sign up
            </button>
            <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}
