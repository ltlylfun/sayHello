# sayHello 事件监听系统

## 目录

- [Socket 连接与断开](#socket连接与断开)
- [在线用户状态事件](#在线用户状态事件)
- [消息传输事件](#消息传输事件)
- [客户端事件订阅与取消订阅](#客户端事件订阅与取消订阅)
- [错误处理和重连机制](#错误处理和重连机制)

## Socket 连接与断开

当用户登录系统时，客户端会与服务器建立 Socket.IO 连接，当用户登出或关闭页面时，该连接会断开。

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant AuthStore as 认证Store
    participant Server as 服务器
    participant UserMap as 用户映射表

    Client->>AuthStore: 用户登录成功
    AuthStore->>AuthStore: connectSocket()
    AuthStore->>Server: socket.connect() {userId}
    Server->>UserMap: 记录 userSocketMap[userId] = socketId
    Server->>Server: 广播用户在线状态
    Server-->>Client: 连接确认

    Client->>AuthStore: 用户登出/关闭页面
    AuthStore->>AuthStore: disconnectSocket()
    AuthStore->>Server: socket.disconnect()
    Server->>UserMap: 删除 delete userSocketMap[userId]
    Server->>Server: 广播用户离线状态
```

### 实现代码

**前端 (useAuthStore.js)**

```javascript
connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
    query: {
      userId: authUser._id,
    },
  });
  socket.connect();

  set({ socket: socket });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });
},

disconnectSocket: () => {
  if (get().socket?.connected) get().socket.disconnect();
}
```

**后端 (socket.js)**

```javascript
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
```

## 在线用户状态事件

系统使用"getOnlineUsers"事件通知所有客户端当前在线的用户列表。

```mermaid
sequenceDiagram
    participant Client1 as 客户端1(新连接)
    participant Server as 服务器
    participant UserMap as 用户映射表
    participant Client2 as 客户端2(已连接)
    participant Client3 as 客户端3(已连接)

    Client1->>Server: socket连接 {userId: user1}
    Server->>UserMap: 添加 userSocketMap[user1] = socketId1
    Server->>Server: 准备广播在线用户
    Server->>Client1: 发送"getOnlineUsers" [user1, user2, user3]
    Server->>Client2: 发送"getOnlineUsers" [user1, user2, user3]
    Server->>Client3: 发送"getOnlineUsers" [user1, user2, user3]

    Client1->>Client1: 更新UI显示在线用户
    Client2->>Client2: 更新UI显示在线用户
    Client3->>Client3: 更新UI显示在线用户
```

### 实现细节

前端订阅该事件，并在 Sidebar 组件中使用它来显示在线状态：

```javascript
socket.on("getOnlineUsers", (userIds) => {
  set({ onlineUsers: userIds });
});

// 在Sidebar组件中使用
{
  onlineUsers.includes(user._id) && (
    <span
      className="absolute bottom-0 right-0 size-3 bg-green-500 
  rounded-full ring-2 ring-zinc-900"
    />
  );
}
```

## 消息传输事件

当用户发送消息时，服务器会使用"newMessage"事件将消息实时发送给接收方。

```mermaid
sequenceDiagram
    participant Sender as 发送方
    participant ClientA as 客户端A
    participant Server as 服务器
    participant DB as 数据库
    participant ClientB as 客户端B
    participant Receiver as 接收方

    Sender->>ClientA: 输入消息并点击发送
    ClientA->>Server: HTTP POST /api/messages/send/{receiverId}
    Server->>DB: 保存消息到数据库
    DB-->>Server: 保存成功
    Server->>Server: 查找接收者socketId
    Server->>ClientB: socket.emit("newMessage", messageObj)
    ClientB->>ClientB: 消息事件处理函数
    ClientB->>ClientB: 更新本地消息状态
    ClientB->>Receiver: 显示新消息
    Server-->>ClientA: HTTP响应消息保存成功
    ClientA->>ClientA: 更新本地消息列表
```

### 实现代码

**后端发送消息：**

```javascript
// 在消息控制器中
const receiverSocketId = getReceiverSocketId(receiverId);
if (receiverSocketId) {
  io.to(receiverSocketId).emit("newMessage", newMessage);
}
```

**前端订阅消息：**

```javascript
subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;

  socket.on("newMessage", (newMessage) => {
    const isMessageSentFromSelectedUser =
      newMessage.senderId === selectedUser._id;
    if (!isMessageSentFromSelectedUser) return;

    set({
      messages: [...get().messages, newMessage],
    });
  });
},

unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  socket.off("newMessage");
}
```

## 客户端事件订阅与取消订阅

为了防止内存泄漏和重复事件处理，客户端实现了订阅和取消订阅机制。

```mermaid
sequenceDiagram
    participant Component as React组件
    participant Store as Zustand Store
    participant Socket as Socket实例

    Component->>Store: 组件挂载时调用subscribeToMessages()
    Store->>Socket: socket.on("newMessage", handleNewMessage)
    Socket-->>Store: 事件注册成功

    Component->>Component: 组件接收消息并渲染

    Component->>Store: 组件卸载时调用unsubscribeFromMessages()
    Store->>Socket: socket.off("newMessage")
    Socket-->>Store: 事件注销成功
```

### 实现代码

在`ChatContainer`组件中的使用：

```javascript
useEffect(() => {
  getMessages(selectedUser._id);
  subscribeToMessages();

  return () => unsubscribeFromMessages();
}, [
  selectedUser._id,
  getMessages,
  subscribeToMessages,
  unsubscribeFromMessages,
]);
```

## 错误处理和重连机制

Socket.IO 内置了自动重连机制，但应用也实现了额外的错误处理逻辑。

```mermaid
sequenceDiagram
    participant Client as 客户端
    participant Socket as Socket.IO客户端
    participant Server as 服务器

    Client->>Socket: 初始化连接
    Socket->>Server: 建立连接
    Server-->>Socket: 连接成功

    Note over Server: 服务器临时断开

    Server--xSocket: 连接断开
    Socket->>Socket: 检测到断开连接
    Socket->>Socket: 自动重连(指数退避)
    Socket->>Server: 尝试重新连接
    Server-->>Socket: 重连成功
    Socket->>Client: 更新连接状态
```

### 实现说明

Socket.IO 客户端默认启用自动重连，可以通过配置选项调整：

```javascript
const socket = io(BASE_URL, {
  query: { userId: authUser._id },
  reconnection: true, // 启用重连
  reconnectionAttempts: 5, // 尝试重连次数
  reconnectionDelay: 1000, // 初始重连延迟
  reconnectionDelayMax: 5000, // 最大重连延迟
});
```

## 完整事件流

下图展示了从用户登录到聊天完成的完整事件流程：

```mermaid
flowchart TD
    Login[用户登录] --> Connect{创建Socket连接}
    Connect --> OnlineStatus[订阅在线用户状态]
    Connect --> MessageListen[订阅消息事件]

    OnlineStatus --> UpdateUI[更新UI显示在线用户]
    MessageListen --> ReceiveMsg[接收新消息]

    SendBtn[发送消息按钮] --> HttpSend[HTTP请求发送消息]
    HttpSend --> ServerSave[服务器保存消息]
    ServerSave --> EmitEvent[触发newMessage事件]

    EmitEvent --> ReceiveMsg
    ReceiveMsg --> RenderMsg[渲染新消息]

    Logout[用户登出] --> Disconnect[断开Socket连接]
    Disconnect --> CleanUp[清理事件监听]

    style Connect fill:#f9f,stroke:#333,stroke-width:2px
    style EmitEvent fill:#bbf,stroke:#33f,stroke-width:2px
    style ReceiveMsg fill:#bbf,stroke:#33f,stroke-width:2px
```
