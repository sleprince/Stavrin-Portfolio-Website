"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TileCard({ item }: { item: any }) {
  const [open, setOpen] = useState(false);

  // Grab media from the array
  const imageUrl =
    item?.media?.find((m: any) => m.type === "image")?.url || "/placeholder.png";
  const audioUrl = item?.media?.find((m: any) => m.type === "audio")?.url || null;

  // Close modal if clicking outside the modal content
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Tile */}
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

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto p-4"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative p-6 flex flex-col">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded mb-4"
            />

            {/* Title */}
            <h2 className="text-2xl font-bold">{item.title}</h2>

            {/* Scrollable content */}
            <div className="mt-2 overflow-auto max-h-[40vh]">
              {/* Preserve line breaks in content */}
              <p className="text-gray-700 whitespace-pre-wrap">
                {item.content || item.excerpt}
              </p>
            </div>

            {/* Audio player */}
            {audioUrl && <audio controls src={audioUrl} className="w-full mt-4" />}
          </div>
        </div>
      )}
    </>
  );
}
