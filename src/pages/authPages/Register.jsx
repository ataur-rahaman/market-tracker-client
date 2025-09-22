import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import RegisterLoading from "../../components/RegisterLoading";
import { Bounce, Slide, toast } from "react-toastify";

const Register = () => {
  const apiKey = import.meta.env.VITE_imgbb_apiKey;
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thisUser, setThisUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { createUser, googleLogin, user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const file = form.photo.files[0];

    // ✅ Password validation regex
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
    setLoading(true);
    // ✅ Upload to imgbb
    const formData = new FormData();
    formData.append("image", file);
    axios
      .post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData)
      .then((res) => {
        if (res.data.success) {
          const photoUrl = res.data.data.url;
          // ✅ creating user
          createUser(email, password)
            .then((result) => {
              setThisUser(result);
              if (result) {
                const profile = {
                  displayName: name,
                  photoURL: photoUrl,
                };
                // ✅ Updating user photo and name
                updateProfile(auth.currentUser, profile)
                  .then(() => {
                    const newUser = {
                      user_role: "user",
                      user_name: name,
                      user_email: email,
                      user_photo: photoUrl,
                      created_at: new Date().toISOString(),
                      last_login: new Date().toISOString(),
                    };
                    // ✅ trying to save new user in database
                    axiosPublic.post("/users", newUser).then((res) => {
                      if (res.data.insertedId) {
                        setLoading(false);
                        Swal.fire({
                          icon: "success",
                          title: "Registration Successful!",
                          html: `
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <img src="${photoUrl}" alt="Uploaded" class="w-24 h-24 rounded-full mt-2 mx-auto"/>
          `,
                        });
                      }
                    });
                    // ✅ redirecting to the desire route or home page
                    navigate(`${location.state ? location.state : "/"}`, {
                      state: { thisUser },
                    });
                  })
                  .catch((error) => {
                    setLoading(false);
                    Swal.fire({
                      icon: "error",
                      title: "Opss",
                      text: error.message,
                    });
                  });
              }
            })
            .catch((error) => {
              setLoading(false);
              if (error) {
                Swal.fire({
                  icon: "error",
                  title: "Registration Failed",
                  text: "That email seems to be taken. Use another email or try again.",
                });
              }
            });
        } else {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: res.data.error.message,
          });
        }
      });
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleGoogleLogin = () => {
    if (user) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Already logged in",
      });
      return;
    }
    googleLogin()
      .then((result) => {
        if (result) {
          const newUser = {
            user_role: "user",
            user_name: result.user.displayName,
            user_email: result.user.email,
            user_photo: result.user.photoURL,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          };

          axiosPublic.post("/users", newUser).then((res) => {
            if (res.data.insertedId) {
              toast("Login successful", {
                position: "top-right",
                autoClose: 5000,
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
          toast("Login successful", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          navigate(`${location.state ? location.state : "/"}`, {
            state: { thisUser },
          });
        }
      })
      .catch((error) => {
        if (error) {
          toast.error("previous attempt was failed", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Slide,
          });
        }
      });
  };

  if (loading) return <RegisterLoading></RegisterLoading>;

  return (
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
            Register
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
  );
};

export default Register;
