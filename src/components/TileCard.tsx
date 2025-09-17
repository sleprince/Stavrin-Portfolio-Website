"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TileCard({ item }: { item: any }) {
  const [open, setOpen] = useState(false);

  const imageUrl =
    item?.media?.find((m: any) => m.type === "image")?.url || "/placeholder.png";
  const audioUrl = item?.media?.find((m: any) => m.type === "audio")?.url || null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  // Simple function to detect URLs and render media
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // YouTube URL
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(trimmed)) {
        const videoIdMatch = trimmed.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        if (videoId) {
          return (
            <iframe
              key={idx}
              width="100%"
              height={200}
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="my-2 rounded"
            />
          );
        }
      }

      // Direct image URL
      if (/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(trimmed)) {
        return <img key={idx} src={trimmed} alt="" className="my-2 rounded" />;
      }

      // Otherwise plain text
      return (
        <p key={idx} className="text-gray-700 whitespace-pre-wrap my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <motion.article
        whileHover={{ scale: 1.05, rotate: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setOpen(true)}
        className="bg-white rounded-lg shadow p-3 cursor-pointer"
      >
        <div className="h-44 w-full overflow-hidden rounded">
          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
        <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>
      </motion.article>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto p-4"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative p-6 flex flex-col">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded mb-4"
            />

            <h2 className="text-2xl font-bold">{item.title}</h2>

            <div className="mt-2 overflow-auto max-h-[40vh]">
              {item.content ? renderContent(item.content) : <p>{item.excerpt}</p>}
            </div>


            {audioUrl && <audio controls src={audioUrl} className="w-full mt-4" />}
          </div>
        </div>
      )}
    </>
  );
}
