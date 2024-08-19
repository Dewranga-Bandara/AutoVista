import { useState, ChangeEvent, FormEvent } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";

// Define the type for form data
interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const navigate = useNavigate();

  // Type the event as ChangeEvent<HTMLInputElement>
  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate email and password fields
    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        navigate("/");
      }
    } catch (error) {
      toast.error("Bad user credentials");
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-8 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://media.istockphoto.com/id/1934712709/photo/cybersecurity-protects-passwords-and-secure-internet-access-it-is-crucial-to-have-secure.jpg?s=612x612&w=0&k=20&c=YK7kfHRsxpcI2Xiz9JZuy5StVlua3iSJ5Bc_cOs2hhU="
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}> 
          <label className="block text-gray-800 mb-2 font-semibold">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="eg: user@gmail.com"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <div className="relative mb-6">
      <label className="block text-gray-800 mb-2 font-semibold">Password</label>
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
                Don't have an account?
                <Link
                  to="/sign-up"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Register
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
              Sign in
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
