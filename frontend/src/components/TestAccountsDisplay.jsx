import { useState } from "react";
import { Copy } from "@icon-park/react";

const TestAccountsDisplay = () => {
  // 测试账号信息
  const testAccounts = [
    { email: "user1@example.com", password: "password123", name: "user1" },
    { email: "user2@example.com", password: "password123", name: "user2" },
    { email: "user3@example.com", password: "password123", name: "user3" },
    { email: "user4@example.com", password: "password123", name: "user4" },
    { email: "user5@example.com", password: "password123", name: "user5" },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="hidden lg:flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="card bg-base-200 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <h2 className="card-title text-center mx-auto mb-4 text-gradient">
              测试账号
            </h2>

            <div className="alert bg-base-100 text-base-content border border-base-300 mb-4 shadow-sm">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-primary flex-shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>
                  该项目为学习项目，你可以不用注册，直接使用以下测试账号
                </span>
              </div>
            </div>

            <div className="tabs tabs-boxed mb-4 justify-center">
              {testAccounts.map((_, index) => (
                <a
                  key={index}
                  className={`tab ${activeTab === index ? "tab-active" : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  用户 {index + 1}
                </a>
              ))}
            </div>

            <div className="bg-base-100 rounded-box p-4 border border-base-300">
              <div className="form-control mb-2">
                <label className="label">
                  <span className="label-text">账号</span>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() =>
                      copyToClipboard(testAccounts[activeTab].email)
                    }
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === testAccounts[activeTab].email && (
                      <span className="text-xs ml-1">已复制</span>
                    )}
                  </button>
                </label>
                <input
                  type="text"
                  value={testAccounts[activeTab].email}
                  className="input input-bordered input-sm"
                  readOnly
                />
              </div>

              <div className="form-control mb-2">
                <label className="label">
                  <span className="label-text">密码</span>
                  <button
                    className="btn btn-xs btn-ghost"
                    onClick={() =>
                      copyToClipboard(testAccounts[activeTab].password)
                    }
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === testAccounts[activeTab].password && (
                      <span className="text-xs ml-1">已复制</span>
                    )}
                  </button>
                </label>
                <input
                  type="text"
                  value={testAccounts[activeTab].password}
                  className="input input-bordered input-sm"
                  readOnly
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">用户名</span>
                </label>
                <input
                  type="text"
                  value={testAccounts[activeTab].name}
                  className="input input-bordered input-sm"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAccountsDisplay;
