import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import TestAccountsDisplay from "../components/TestAccountsDisplay";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  PreviewOpen,
  PreviewClose,
  Loading,
  MessageEmoji,
} from "@icon-park/react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-base-100">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              <div className="relative">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:shadow-glow-lg transition-all duration-500 border border-primary/30 float-animation">
                  <MessageEmoji className="size-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                {/* 装饰性光环 */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gradient">欢迎回来</h1>
                <p className="text-base-content/70 text-lg">
                  登录你的账户，开始聊天
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content/80">
                  邮箱地址
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-12 pr-4 h-12 input-focus bg-base-100/50 backdrop-blur-sm focus:bg-base-100 transition-all duration-200"
                  placeholder="输入你的邮箱地址"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {/* 输入框装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-base-content/80">
                  密码
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-12 pr-12 h-12 input-focus bg-base-100/50 backdrop-blur-sm focus:bg-base-100 transition-all duration-200"
                  placeholder="输入你的密码"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:text-primary transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <PreviewOpen className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors duration-200" />
                  ) : (
                    <PreviewClose className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors duration-200" />
                  )}
                </button>
                {/* 输入框装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gradient w-full h-12 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2">
                  <Loading className="animate-spin" />
                  <span>登录中...</span>
                </div>
              ) : (
                <span className="group-hover:scale-105 transition-transform duration-200">
                  立即登录
                </span>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/70">
              还没有账号?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-secondary font-semibold transition-colors duration-200 hover:underline decoration-2 underline-offset-2"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Test Accounts */}
      <TestAccountsDisplay />
    </div>
  );
};
export default LoginPage;
