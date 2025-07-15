import { MessageEmoji } from "@icon-park/react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100">
      <div className="max-w-md text-center space-y-8 animate-fade-in">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center float-animation border border-primary/30 group-hover:shadow-glow-lg transition-all duration-500">
              <MessageEmoji className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* 装饰性光环 */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            {/* 装饰性光点 */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded-full opacity-80 animate-pulse"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gradient">
            欢迎来到 sayHello!
          </h2>
          <p className="text-base-content/70 text-lg leading-relaxed">
            本项目为学习性质项目
            <br />
            <span className="text-sm text-base-content/50">
              会话记录会定期删除
            </span>
          </p>
        </div>

        {/* 装饰性元素 */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-secondary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
