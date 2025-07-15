import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageEmoji, User, Setting, Logout } from "@icon-park/react";
const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="fixed w-full top-0 z-50 animate-slide-down">
      {/* 背景 */}
      <div className="absolute inset-0 bg-base-100 backdrop-blur-xl border-b border-base-300/50"></div>

      <div className="relative w-full px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo区域 */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group flex items-center gap-3 hover:scale-105 transition-all duration-300"
            >
              {/* Logo图标 */}
              <div className="relative">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:shadow-glow transition-all duration-300 border border-primary/20">
                  <MessageEmoji className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                {/* 装饰性光点 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-primary to-secondary rounded-full opacity-80 group-hover:animate-pulse"></div>
              </div>

              {/* 品牌名称 */}
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">
                  sayHello
                </h1>
                <span className="text-xs text-base-content/60 -mt-1">
                  聊天应用
                </span>
              </div>
            </Link>
          </div>

          {/* 导航按钮区域 */}
          <div className="flex items-center gap-3">
            {/* 主题设置按钮 */}
            <Link
              to={"/settings"}
              className="btn btn-sm btn-ghost gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
            >
              <Setting className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">主题设置</span>
            </Link>

            {authUser && (
              <>
                {/* 个人主页按钮 */}
                <Link
                  to={"/profile"}
                  className="btn btn-sm btn-ghost gap-2 hover:bg-secondary/10 hover:text-secondary transition-all duration-300 group"
                >
                  <User className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline">个人主页</span>
                </Link>

                {/* 退出按钮 */}
                <button
                  className="btn btn-sm btn-ghost gap-2 hover:bg-error/10 hover:text-error transition-all duration-300 group"
                  onClick={logout}
                >
                  <Logout className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
