import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";

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
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Fetch user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
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

  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/* Name Input */}
            <div className="mb-6">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={onChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out ${
                  isEditing ? "bg-red-200 focus:bg-red-200" : ""
                }`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={onChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center ">
                {isEditing ? (
                  <>
                    <span
                      onClick={async () => {
                        await onSubmit();
                        toggleEdit();
                      }}
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
