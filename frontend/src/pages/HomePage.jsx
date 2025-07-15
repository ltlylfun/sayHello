import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen pt-16 bg-base-100 relative overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <div className="bg-base-100/80 backdrop-blur-xl w-full h-full animate-scale-in overflow-hidden">
          <div className="flex h-full">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
