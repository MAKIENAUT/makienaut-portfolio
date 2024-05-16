"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import localFont from "next/font/local";
import { Poppins, Concert_One } from "next/font/google";

const poppins = Poppins({ weight: ["500", "400"], subsets: ["latin"] });

const concert_one = Concert_One({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

// const jaro = localFont({ src: "../../assets/fonts/Jaro-Regular-VariableFont_opsz.ttf" });

export default function Home() {
  const [linksVisible, setLinksVisible] = useState(false);

  const toggleLinks = () => {
    setLinksVisible(!linksVisible);
  };

  return (
    <main className={`w-full h-full flex-col border`}>
      <article className={` flex-col justify-start text-center border`}>
        <h3 className="text-2xl">Welcome to my</h3>
        <div
          className={`flex justify-center border border-white w-full gap-3 align-middle text-7xl`}
        >
          <span>&#60;</span>
          <div
            className={`inline-flex items-center justify-between w-${
              linksVisible ? "full" : "fit"
            } ease-out transition-all duration-500`}
          >
            {linksVisible && (
              <div className="flex w-full justify-evenly animate-slideLeft">
                <Link href={"#"} className="text-base">
                  TL;DR
                </Link>
                <Link href={"#"} className="text-base">
                  About
                </Link>
              </div>
            )}
            <button
              className={`inline-flex items-center justify-between text-${
                linksVisible ? "5xl" : "7xl"
              } transition-all duration-500`}
              onClick={toggleLinks}
            >
              WEB
            </button>
            {linksVisible && (
              <div className="flex w-full justify-evenly animate-slideRight">
                <Link href={"#"} className="text-base">
                  Projects
                </Link>
                <Link href={"#"} className="text-base">
                  Contact
                </Link>
              </div>
            )}
          </div>
          <span className="animate-slideRight">&#62;</span>
        </div>
      </article>
      <article className="py-4 h-fit">
        <div className={`${poppins.className} w-full`}>
          <h3 className="text-xl font-thin">Hemlo! I am</h3>
          <h1
            className={`${concert_one.className} w-fit animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-1 text-5xl text-white font-bold`}
          >
            Mc Ray Escoto
          </h1>
        </div>
      </article>
    </main>
  );
}
