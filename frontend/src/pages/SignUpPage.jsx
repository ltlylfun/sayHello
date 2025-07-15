import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  Mail,
  User,
  Lock,
  PreviewOpen,
  PreviewClose,
  Loading,
  MessageEmoji,
} from "@icon-park/react";
import { Link } from "react-router-dom";

import TestAccountsDisplay from "../components/TestAccountsDisplay";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name 需要填写");
    if (!formData.email.trim()) return toast.error("Email 需要填写");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password 需要填写");
    if (formData.password.length < 6)
      return toast.error("Password 至少6个字符");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              <div className="relative">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center group-hover:shadow-glow-lg transition-all duration-500 border border-secondary/30 float-animation">
                  <MessageEmoji className="size-10 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                {/* 装饰性光环 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  加入我们
                </h1>
                <p className="text-base-content/70 text-lg">
                  创建账户，开始你的聊天之旅
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">用户名</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">邮箱地址</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">密码</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <PreviewOpen className="size-5 text-base-content/40" />
                  ) : (
                    <PreviewClose className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loading className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              已经有账号了吗?{" "}
              <Link to="/login" className="link link-primary">
                登录
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <TestAccountsDisplay />
    </div>
  );
};
export default SignUpPage;
