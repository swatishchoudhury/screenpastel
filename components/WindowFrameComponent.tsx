import type React from "react";

const WindowFrameComponent = ({
  type,
  children,
  darkMode,
  borderRadius = 12,
  borderWidth = 0,
  borderColor = "#ffffff",
  address,
}: {
  type: string;
  children: React.ReactNode;
  darkMode: boolean;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  address: string;
}) => {
  const renderTitleBar = () => {
    if (type === "macos") {
      return (
        <div
          className={`flex items-center px-3 py-1.5 ${darkMode ? "bg-[#2d2d2d]" : "bg-[#ececec]"}`}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
            <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
          </div>
        </div>
      );
    }

    if (type === "windows") {
      return (
        <div
          className={`flex items-center justify-end px-3 py-1.5 ${darkMode ? "bg-[#202020]" : "bg-[#f3f3f3]"} border-b ${darkMode ? "border-[#2d2d2d]" : "border-[#e0e0e0]"}`}
        >
          <div className="flex gap-0">
            <button
              className={`flex items-center justify-center w-10 h-6 hover:bg-opacity-10 ${darkMode ? "hover:bg-white" : "hover:bg-black"} transition-colors`}
            >
              <div
                className={`w-2 h-[1px] ${darkMode ? "bg-white" : "bg-black"}`}
              ></div>
            </button>
            <button
              className={`flex items-center justify-center w-10 h-6 hover:bg-opacity-10 ${darkMode ? "hover:bg-white" : "hover:bg-black"} transition-colors`}
            >
              <div
                className={`w-2 h-2 border ${darkMode ? "border-white" : "border-black"}`}
              ></div>
            </button>
            <button className="flex items-center justify-center w-10 h-6 hover:bg-[#c42b1c] transition-colors group">
              <svg
                className={`w-2 h-2 ${darkMode ? "stroke-white" : "stroke-black"} group-hover:stroke-white`}
                viewBox="0 0 10 10"
              >
                <path
                  d="M 0 0 L 10 10 M 10 0 L 0 10"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    if (type === "browser") {
      return (
        <div className={`${darkMode ? "bg-[#2d2d2d]" : "bg-[#f5f5f5]"}`}>
          <div
            className={`flex items-center px-3 py-1.5 border-b ${darkMode ? "border-[#3d3d3d]" : "border-[#e0e0e0]"}`}
          >
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <div
              className={`flex-1 h-6 rounded-md ${darkMode ? "bg-[#1e1e1e]" : "bg-white"} px-3 flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <span>{address}</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === "macos-unified") {
      return (
        <div
          className={`flex items-center px-3 py-1.5 ${darkMode ? "bg-[#2d2d2d]" : "bg-[#ececec]"}`}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#a8a8a8]"></div>
            <div className="w-3 h-3 rounded-full bg-[#a8a8a8]"></div>
            <div className="w-3 h-3 rounded-full bg-[#a8a8a8]"></div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        borderRadius: `${borderRadius}px`,
        border:
          borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      {type !== "none" && renderTitleBar()}
      <div>{children}</div>
    </div>
  );
};

export default WindowFrameComponent;
