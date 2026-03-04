import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (!savedUser || savedUser.email !== email) {
      alert("Email không tồn tại!");
      return;
    }

    alert("Link đặt lại mật khẩu đã được gửi tới email của bạn (demo)");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Quên mật khẩu
        </h2>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Nhập email của bạn để đặt lại mật khẩu
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-4 py-2 mb-6 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Gửi yêu cầu
        </button>

        <div className="text-center mt-4 text-sm">
          <Link
            to="/login"
            className="text-red-500 font-medium hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;