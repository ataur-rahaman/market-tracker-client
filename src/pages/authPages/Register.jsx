import React, { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import { AiOutlineUser, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import useAuth from "../../hooks/useAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

const Register = () => {
  const apiKey = import.meta.env.VITE_imgbb_apiKey;
  const [preview, setPreview] = useState(null);
  const { createUser } = useAuth();

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

    // ✅ Upload to imgbb
    const formData = new FormData();
    formData.append("image", file);
    axios
      .post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData)
      .then((res) => {
        if (res.data.success) {
          const photoUrl = res.data.data.url;
          console.log(photoUrl);
          createUser(email, password)
            .then((result) => {
              if (result) {
                const profile = {
                  displayName: name,
                  photoURL: photoUrl,
                };
                updateProfile(auth.currentUser, profile)
                  .then(() => {
                    Swal.fire({
                      icon: "success",
                      title: "Registration Successful!",
                      html: `
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <img src="${photoUrl}" alt="Uploaded" class="w-24 h-24 rounded-full mt-2 mx-auto"/>
          `,
                    });
                  })
                  .catch((error) => {
                    Swal.fire({
                      icon: "error",
                      title: "Opss",
                      text: error.message,
                    });
                  });
              }
            })
            .catch((error) => {
              Swal.fire({
                icon: "error",
                title: "Opss",
                text: error.message,
              });
            });

        } else {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex items-center border rounded-lg px-3 py-2">
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
          <div className="flex items-center border rounded-lg px-3 py-2">
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
          <div className="flex items-center border rounded-lg px-3 py-2">
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Register
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
