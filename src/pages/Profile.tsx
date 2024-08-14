import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  email: string;
}

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({
          name: user.displayName || "",
          email: user.email || "",
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  function onLogout() {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        // Handle sign-out error if needed
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

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/* Name Input */}
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={onChange}
              disabled={!isEditing}
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
            />

            {/* Email Input */}
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={onChange}
              disabled={!isEditing}
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
            />

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center ">
                {isEditing ? (
                  <>
                    <span
                      onClick={toggleEdit}
                      className="text-blue-600 hover:text-blue-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                    >
                      Save
                    </span>
                    <span
                      onClick={toggleEdit}
                      className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                    >
                      Cancel
                    </span>
                  </>
                ) : (
                  <>
                    Do you want to change your name?
                    <span
                      onClick={toggleEdit}
                      className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                    >
                      Edit
                    </span>
                  </>
                )}
              </p>
              <p
                onClick={onLogout}
                className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out cursor-pointer"
              >
                Sign out
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
