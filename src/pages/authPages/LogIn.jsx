import React, { useState } from "react";
import Swal from "sweetalert2";
import LoginLoader from "../../components/LoginLoader";
import { AiOutlineLock, AiOutlineMail } from "react-icons/ai";
import { Link } from "react-router";
import useAuth from "../../hooks/useAuth";

const LogIn = () => {
  const [loading, setLoading] = useState(false);
  const {logInUser} = useAuth();
  console.log(logInUser);
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
    setLoading(true);
    logInUser(email, password)
      .then((result) => {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          html: `
                    <p><b>Name:</b> ${result.user.displayName}</p>
                    <p><b>Email:</b> ${result.user.email}</p>
                    <img src="${result.user.photoURL}" alt="Uploaded" class="w-24 h-24 rounded-full mt-2 mx-auto"/>
                  `,
        });
      })
      .catch((error) => {
        setLoading(false);
        if (error) {
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Account does not exist. Please check and try again.",
          });
        }
      });
  };

  if(loading) return <LoginLoader></LoginLoader>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
