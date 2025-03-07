import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { MessageEmoji, User, Setting, Logout } from "@icon-park/react";
const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageEmoji className="w-5 h-5 text-primary " size={22} />
              </div>
              <h1 className="text-lg font-bold">sayHello</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              `}
            >
              <Setting />
              <span className="hidden sm:inline">主题设置</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User />
                  <span className="hidden sm:inline">个人主页</span>
                </Link>

                <button
                  className="flex btn btn-sm gap-2 items-center"
                  onClick={logout}
                >
                  <Logout />
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
