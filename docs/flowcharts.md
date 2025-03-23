# sayHello 流程图文档

## 目录

- [登录认证流程](#登录认证流程)
- [消息发送与接收流程](#消息发送与接收流程)
- [用户上线/离线状态变更流程](#用户上线离线状态变更流程)
- [会话保持与恢复流程](#会话保持与恢复流程)
- [头像上传流程](#头像上传流程)
- [主题切换流程](#主题切换流程)
- [消息实时监听与更新流程](#消息实时监听与更新流程)
- [全栈数据流和通信概览](#全栈数据流和通信概览)
- [技术架构图](#技术架构图)

## 登录认证流程

```mermaid
sequenceDiagram
    participant UI as 用户界面
    participant Frontend as 前端(React/Zustand)
    participant Backend as 后端(Express)
    participant DB as 数据库(MongoDB)

    UI->>Frontend: 输入登录信息
    Frontend->>Backend: POST /api/auth/login
    Backend->>DB: 查询用户
    DB-->>Backend: 返回用户信息
    Backend->>DB: 验证密码
    Backend->>DB: 生成JWT Token
    DB-->>Backend: Token创建成功
    Backend-->>Frontend: 设置HTTP-only cookie
    Backend-->>Frontend: 返回用户数据
    Frontend->>Backend: socket.connect() (附带userId)
    Backend->>DB: 记录用户上线
    Backend-->>Frontend: socket: "getOnlineUsers"
    Frontend->>UI: 更新UI显示已登录及在线用户列表
```

## 消息发送与接收流程

```mermaid
sequenceDiagram
    participant Sender as 发送方
    participant SenderUI as 发送方前端
    participant Server as 后端服务器
    participant ReceiverUI as 接收方前端
    participant Receiver as 接收方

    Sender->>SenderUI: 选择联系人
    SenderUI->>Server: GET /messages/{userId}
    Server->>DB: 查询历史消息
    Server-->>SenderUI: 返回历史消息
    Sender->>SenderUI: 输入消息并发送
    SenderUI->>Server: POST /messages/send/
    Server->>DB: 存储消息到数据库
    DB-->>Server: 消息保存成功
    Server-->>SenderUI: HTTP响应(消息对象)
    SenderUI->>SenderUI: 本地更新消息列表
    Server->>ReceiverUI: 查找接收方socketId
    Server->>ReceiverUI: socket.emit("newMessage")
    ReceiverUI->>Receiver: 执行消息监听回调
    ReceiverUI->>Receiver: 更新UI显示新消息
```

## 用户上线离线状态变更流程

```mermaid
sequenceDiagram
    participant UI as 用户界面
    participant Frontend as 前端(Socket.IO)
    participant Backend as 后端Socket.IO
    participant Clients as 所有其他在线客户端

    UI->>Frontend: 用户登录/打开页面
    Frontend->>Backend: socket.connect()
    Backend->>Backend: 记录socketId和userId
    Backend->>Clients: io.emit("getOnlineUsers") [所有在线用户列表]
    Clients-->>Frontend: 广播在线用户列表
    Frontend->>UI: 更新UI显示在线状态

    UI->>Frontend: 用户关闭页面/登出
    Frontend->>Backend: socket.disconnect()
    Backend->>Backend: 移除用户记录
    Backend->>Clients: io.emit("getOnlineUsers") [更新后的在线用户列表]
    Clients-->>Frontend: 广播更新后的在线用户列表
    Frontend->>UI: 更新UI移除离线用户
```

## 会话保持与恢复流程

```mermaid
sequenceDiagram
    participant Browser as 用户浏览器
    participant App as 前端App.jsx
    participant AuthStore as 前端Auth Store
    participant Middleware as 后端Auth Middleware
    participant DB as 数据库

    Browser->>App: 页面加载
    App->>AuthStore: useEffect调用
    AuthStore->>AuthStore: checkAuth()
    AuthStore->>Middleware: GET /api/auth/check
    Middleware->>Middleware: 读取请求cookie
    Middleware->>Middleware: 验证JWT token
    Middleware->>DB: 根据userId查询用户
    DB-->>Middleware: 返回用户数据
    Middleware-->>AuthStore: 返回用户信息
    AuthStore->>AuthStore: connectSocket()
    AuthStore-->>App: isCheckingAuth=false, authUser=userData
    App->>Browser: 渲染已认证的界面
```

## 头像上传流程

```mermaid
sequenceDiagram
    participant UI as 用户界面
    participant Profile as 前端ProfilePage
    participant AuthStore as 前端AuthStore
    participant API as 后端API
    participant Cloud as Cloudinary

    UI->>Profile: 选择图片文件
    Profile->>Profile: FileReader读取转为Base64
    Profile->>AuthStore: updateProfile() (Base64图像)
    AuthStore->>API: PUT /api/auth/update-profile
    API->>Cloud: 上传图像
    Cloud-->>API: 返回图像URL
    API->>DB: 更新用户记录
    DB-->>API: 保存成功
    API-->>AuthStore: 返回更新后的用户数据
    AuthStore-->>Profile: 更新本地状态
    Profile->>UI: 显示新头像
```

## 主题切换流程

```mermaid
sequenceDiagram
    participant UI as 用户界面
    participant Settings as SettingsPage
    participant ThemeStore as ThemeStore
    participant Storage as LocalStorage

    UI->>Settings: 选择主题
    Settings->>ThemeStore: setTheme(theme)
    ThemeStore->>Storage: 存储主题
    ThemeStore->>ThemeStore: 更新state
    ThemeStore-->>Settings: 主题更新通知
    Settings->>UI: 应用新主题样式
```

## 消息实时监听与更新流程

```mermaid
sequenceDiagram
    participant Chat as ChatContainer组件(React)
    participant Store as useChatStore(Zustand)
    participant Socket as Socket.IO客户端
    participant Server as 服务器
    participant ReceiverSocket as 接收方Socket

    Chat->>Store: 组件挂载
    Store->>Store: subscribeToMessages()
    Store->>Socket: socket.on("newMessage", callback)
    ReceiverSocket->>Server: 发送newMessage事件
    Server->>Socket: 等待消息事件
    Socket-->>Store: 收到newMessage事件
    Store->>Store: 验证消息来源是否是当前聊天对象
    Store->>Store: 更新messages状态
    Store-->>Chat: 状态更新触发重新渲染
    Chat->>Store: 执行useEffect(检测messages变化)
    Chat->>Chat: scrollIntoView()(滚动到最新消息)
    Chat->>Store: 组件卸载
    Store->>Store: unsubscribeFromMessages()
    Store->>Socket: socket.off("newMessage")(移除事件监听)
```

## 全栈数据流和通信概览

```mermaid
flowchart TD
    subgraph HTTP通信
        UI[用户界面] -->|用户操作| React[React组件]
        React -->|调用store方法| Zustand[Zustand Store]
        Zustand -->|HTTP请求| Axios[Axios/HTTP]
        Axios -->|处理请求| Express[Express后端]
        Express -->|数据库操作| MongoDB[MongoDB]
        MongoDB -->|返回数据| Express
        Express -->|返回响应| Zustand
        Zustand -->|更新状态| Zustand
        Zustand -->|状态变化通知| React
        React -->|更新UI| UI
    end

    subgraph WebSocket通信
        UI2[用户界面] --> Socket_Client[Socket.IO客户端]
        Socket_Client -->|Socket事件监听| Zustand2[Zustand Store]
        Socket_Server[Socket.IO服务端] -->|服务器事件| WebSocket[WebSocket连接]
        WebSocket --> Socket_Client
        Socket_Client -->|事件通知| Zustand2
        Zustand2 -->|更新状态| Zustand2
        Zustand2 -->|即时更新UI| UI2
    end
```

## 技术架构图

```mermaid
flowchart TD
    subgraph 客户端层
        React[React前端]
        subgraph React
            Components[组件系统]
            Router[路由系统]
            State["状态管理(Zustand)"]
        end
    end

    subgraph 通信层
        API["API请求(Axios/Fetch)"]
        WebSocket["WebSocket连接(Socket.IO)"]
    end

    subgraph 服务器层
        Express[Express服务器]
        subgraph Express
            Routes[API路由]
            Middleware[中间件]
            Controllers[控制器]
            SocketIO[Socket.IO服务]
        end
    end

    subgraph 数据层
        DB[MongoDB数据库]
        subgraph DB
            UserModel[用户模型]
            MessageModel[消息模型]
        end
        CloudStorage["Cloudinary存储(用于图片/头像存储)"]
    end

    React <--> API
    React <--> WebSocket
    API <--> Express
    WebSocket <--> Express
    Express <--> DB
    Express <--> CloudStorage
```
