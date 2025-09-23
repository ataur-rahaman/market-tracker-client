import React, { useState } from "react";
import Swal from "sweetalert2";
import LoginLoader from "../../components/LoginLoader";
import { AiOutlineLock, AiOutlineMail } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import { Bounce, Slide, toast } from "react-toastify";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const LogIn = () => {
  const axiosPublic = useAxiosPublic();
  const { logInUser, googleLogin, user } = useAuth();
  const [thisUser, setThisUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from.pathname;
  console.log(redirectTo);
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

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

    logInUser(email, password)
      .then((result) => {
        setThisUser(result);

        toast.success("Login successful", {
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
        // ✅ redirecting to the desire route or home page
        navigate(`${redirectTo ? redirectTo : "/"}`, {
          state: { thisUser },
        });
      })
      .catch((error) => {

        if (error) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Account does not exist. Please check and try again.",
          });
        }
      });
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
              toast.success("Login successful", {
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
            }
          });
          toast.success("Login successful", {
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
          navigate(`${redirectTo ? redirectTo : "/"}`, {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 pt-[50px]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Login
          </button>
        </form>

        {/* Link to register */}
        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            state={location?.state}
            to="/register"
            className="text-primary hover:underline"
          >
            Register
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

export default LogIn;
