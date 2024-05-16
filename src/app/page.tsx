"use client";
import Link from "next/link";

import { useState, useEffect } from "react";

export default function Home() {
  const [text, setText] = useState("Do u like me? hehe :3");
  const [noButtonPosition, setNoButtonPosition] = useState({
    left: 0,
    top: 0,
  });
  const [isNoButtonClicked, setIsNoButtonClicked] = useState(false);

  const handleYesClick = () => {
    setText("YIPPIEEEEE");
  };

  const handleNoClick = () => {
    if (!isNoButtonClicked) {
      setIsNoButtonClicked(true);
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxLeft = viewportWidth - 200; // Assuming button width is 200px
    const maxTop = viewportHeight - 100; // Assuming button height is 100px

    const randomLeft = Math.floor(Math.random() * maxLeft);
    const randomTop = Math.floor(Math.random() * maxTop);

    setNoButtonPosition({ left: randomLeft, top: randomTop });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <Link
        href={"https://media1.tenor.com/m/NVS8DOBcunIAAAAC/yippee-cat.gif"}
        className="mb-8 text-center"
      >
        {text}
      </Link>

      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={handleYesClick}
        >
          Yes
        </button>
        <button
          className={`px-4 py-2 bg-red-500 text-white rounded-md ${
            isNoButtonClicked ? "absolute" : ""
          }`}
          style={{
            left: isNoButtonClicked ? noButtonPosition.left : 0,
            top: isNoButtonClicked ? noButtonPosition.top : 0,
          }}
          onClick={handleNoClick}
        >
          No
        </button>
      </div>
    </main>
  );
}
