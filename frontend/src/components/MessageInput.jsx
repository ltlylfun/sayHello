import { useRef, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { Picture, Send, Close } from "@icon-park/react";
import toast from "react-hot-toast";

const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func(...args);
      lastCall = now;
    }
  };
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!text.trim() && !imagePreview) return;
      if (isSending) return;

      try {
        setIsSending(true);
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });

        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [text, imagePreview, isSending, sendMessage]
  );

  const throttledSendMessage = useCallback(
    (e) => {
      throttle((evt) => handleSendMessage(evt), 1000)(e);
    },
    [handleSendMessage]
  );

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <Close className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={throttledSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-primary
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Picture size={22} />
          </button>
        </div>
        <button
          type="submit"
          className="btn  btn-primary"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
