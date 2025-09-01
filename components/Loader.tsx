import React, { useState, useEffect } from 'react';

const loadingMessages = [
  'Đang khởi tạo mạng nơ-ron...',
  'Đang quét hàng petabyte dữ liệu...',
  'Đối chiếu với kho lưu trữ lượng tử...',
  'Phân tích các mẫu ngôn ngữ...',
  'Tổng hợp báo cáo phân tích cuối cùng...'
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
      <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-lg font-medium font-mono transition-all duration-300">{message}</p>
    </div>
  );
};

export default Loader;