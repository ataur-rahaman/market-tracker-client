import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import { Bounce, Slide, toast } from "react-toastify";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Register = () => {
  const apiKey = import.meta.env.VITE_ImgbbApiKey;
  const [preview, setPreview] = useState(null);
  const [thisUser, setThisUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const { createUser, googleLogin, user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  apiKey;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const file = form.photo.files[0];

    // password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must contain at least 6 characters, one uppercase, one lowercase, and one number.",
      });
      return;
    }

    if (!file) {
      Swal.fire({
        icon: "error",
        title: "Missing Photo",
        text: "Please upload a profile photo.",
      });
      return;
    }

    try {
      setLoading(true);
      // 1) Upload image to imgbb (multipart/form-data)
      const formData = new FormData();
      formData.append("image", file);
      file;

      const imgbbUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
      const imgbbRes = await axios.post(imgbbUrl, formData);

      imgbbRes;

      if (!imgbbRes?.data?.success) {
        setLoading(false);
        throw new Error(
          imgbbRes?.data?.error?.message || "Image upload failed"
        );
      }

      const photoUrl = imgbbRes.data.data.url;

      // 2) Create user with Firebase Auth
      const createResult = await createUser(email, password);
      // setThisUser for later navigation state if you want
      setThisUser(createResult);

      // 3) Update Firebase profile (displayName and photoURL)
      const profile = {
        displayName: name,
        photoURL: photoUrl,
      };
      await updateProfile(auth.currentUser, profile);

      // 4) Prepare user object to store in DB
      const newUser = {
        user_role: "user",
        user_name: name,
        user_email: email,
        user_photo: photoUrl,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      // 5) Save user to backend via axiosSecure
      const saveRes = await axiosSecure.post("/users", newUser);

      // 6) Handle response
      if (
        saveRes?.data?.insertedId ||
        saveRes?.status === 200 ||
        saveRes?.status === 201
      ) {
        setLoading(false);
        toast.success("Registration successful", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } else {
        setLoading(false);
        // Some backends return 200 with existing user object instead of insertedId
        toast.success("Registration completed", {
          position: "top-right",
          autoClose: 2500,
          transition: Bounce,
        });
      }

      // 7) Redirect
      navigate(redirectTo, { state: { thisUser } });
    } catch (err) {
      setLoading(false);
      console.error("Register error:", err);
      // Show useful message if available from server or axios
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: message,
      });
    }
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleGoogleLogin = async () => {
    if (user) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Already logged in",
      });
      return;
    }

    try {
      const result = await googleLogin();
      if (!result) throw new Error("Google login failed");

      const newUser = {
        user_role: "user",
        user_name: result.user.displayName,
        user_email: result.user.email,
        user_photo: result.user.photoURL,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      // Save user on backend (no profile photo upload needed because google provided it)
      const saveRes = await axiosSecure.post("/users", newUser);

      if (
        saveRes?.data?.insertedId ||
        saveRes?.status === 200 ||
        saveRes?.status === 201
      ) {
        axiosPublic
          .patch(`/users/last-login/${result.user.email}`)
          .then((res) => {
            if (res.modifiedCount) {
              toast.success("Login updated", {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              });
            }
          });

        toast.success("Login successful", {
          position: "top-right",
          autoClose: 2500,
          transition: Bounce,
        });
      } else {
        toast.success("Login successful", {
          position: "top-right",
          autoClose: 2500,
          transition: Bounce,
        });
      }

      navigate(redirectTo, { state: { thisUser } });
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Previous attempt failed", {
        position: "top-right",
        autoClose: 2000,
        transition: Slide,
      });
    }
  };

  return (
    <>
      <title>Register</title>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 pt-[50px]">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Create an Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <AiOutlineUser className="text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <AiOutlineMail className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full outline-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handlePreview}
                className="file-input file-input-bordered w-full"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full mt-2 border mx-auto"
                />
              )}
              <p className="p-2 text-yellow-500">
                if unable to register, change the image and try again.
              </p>
            </div>

            {/* Password */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <AiOutlineLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full cursor-pointer bg-primary hover:bg-secondary text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? (
                <span className="loading loading-spinner text-white"></span>
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Link to Login */}
          <p className="text-sm text-center mt-4 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>

          <div className="divider">OR</div>

          <button
            onClick={handleGoogleLogin}
            className="btn w-full bg-white text-black border-[#e5e5e5]"
          >
            {/* Google SVG */}
            <svg
              aria-label="Google logo"
              width="16"
              height="16"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g>
                <path d="m0 0H512V512H0" fill="#fff"></path>
                <path
                  fill="#34a853"
                  d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                ></path>
                <path
                  fill="#4285f4"
                  d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                ></path>
                <path
                  fill="#fbbc02"
                  d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                ></path>
                <path
                  fill="#ea4335"
                  d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                ></path>
              </g>
            </svg>
            Login with Google
          </button>
        </div>
      </div>
    </>
  );
};

export default Register;
