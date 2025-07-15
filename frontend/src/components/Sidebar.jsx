import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { User } from "@icon-park/react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [maxVisibleUsers, setMaxVisibleUsers] = useState(5);
  const headerRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const calculateVisibleUsers = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const containerHeight = window.innerHeight - headerHeight - 40;
        const userItemHeight = 80;
        const maxUsers = Math.floor(containerHeight / userItemHeight);
        setMaxVisibleUsers(Math.max(3, maxUsers));
      }
    };

    calculateVisibleUsers();
    window.addEventListener("resize", calculateVisibleUsers);

    return () => {
      window.removeEventListener("resize", calculateVisibleUsers);
    };
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const visibleUsers = filteredUsers.slice(0, maxVisibleUsers);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300/50 flex flex-col transition-all duration-300 bg-base-100/50 backdrop-blur-sm">
      <div
        ref={headerRef}
        className="border-b border-base-300/50 w-full p-5 bg-gradient-to-r from-base-100/80 to-base-100/60"
      >
        <div className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
            <User className="size-5 text-primary" />
          </div>
          <span className="font-semibold hidden lg:block text-base-content/80 group-hover:text-base-content transition-colors duration-200">
            在线用户
          </span>
        </div>

        {/* 在线用户过滤器 */}
        <div className="mt-4 hidden lg:flex items-center justify-between">
          <label className="cursor-pointer flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm text-base-content/70 group-hover:text-base-content transition-colors duration-200">
              仅显示在线
            </span>
          </label>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-success font-medium">
              {onlineUsers.length - 1} 在线
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full py-2 px-2 overflow-hidden">
        <div className="space-y-1 h-full flex flex-col">
          {visibleUsers.map((user, index) => (
            <button
              key={user._id}
              onClick={() => {
                // 只有在选择不同用户时才调用 setSelectedUser
                if (selectedUser?._id !== user._id) {
                  setSelectedUser(user);
                }
              }}
              className={`
              w-full p-3 flex items-center gap-3 rounded-xl
              transition-all duration-200 group card-hover
              ${
                selectedUser?._id === user._id
                  ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 shadow-lg"
                  : "hover:bg-base-200/80 hover:shadow-md"
              }
            `}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div className="relative mx-auto lg:mx-0">
                <div className="relative">
                  <img
                    src={user.profilePic || "/message-emoji.svg"}
                    alt={user.fullName}
                    className={`size-12 object-cover rounded-full transition-all duration-200 ${
                      selectedUser?._id === user._id
                        ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-base-100"
                        : "group-hover:ring-2 group-hover:ring-base-300/50 group-hover:ring-offset-2 group-hover:ring-offset-base-100"
                    }`}
                  />
                  {onlineUsers.includes(user._id) && (
                    <div className="online-indicator"></div>
                  )}
                </div>
              </div>

              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div
                  className={`font-semibold truncate transition-colors duration-200 ${
                    selectedUser?._id === user._id
                      ? "text-primary"
                      : "text-base-content group-hover:text-base-content"
                  }`}
                >
                  {user.fullName}
                </div>
                <div
                  className={`text-sm transition-colors duration-200 flex items-center gap-1 ${
                    onlineUsers.includes(user._id)
                      ? "text-success"
                      : "text-base-content/60"
                  }`}
                >
                  {onlineUsers.includes(user._id) && (
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                  )}
                  {onlineUsers.includes(user._id) ? "在线" : "离线"}
                </div>
              </div>
            </button>
          ))}

          {visibleUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">
              No online users
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
