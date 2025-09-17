"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function TileCard({ item }: { item: any }) {
  // State to control whether modal is open
  const [open, setOpen] = useState(false);

  // Grab image & audio from media array
  const imageUrl =
    item?.media?.find((m: any) => m.type === "image")?.url || "/placeholder.png";
  const audioUrl = item?.media?.find((m: any) => m.type === "audio")?.url || null;

  // Helper: close modal when clicking outside content
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* ---------- Tile Card ---------- */}
      <motion.article
        whileHover={{ scale: 1.05, rotate: 1 }} // jiggle/scale effect
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setOpen(true)}
        className="bg-white rounded-lg shadow p-3 cursor-pointer"
      >
        {/* Thumbnail image */}
        <div className="h-44 w-full overflow-hidden rounded">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title and excerpt */}
        <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
        <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>
      </motion.article>

      {/* ---------- Modal ---------- */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={handleBackgroundClick} // click outside to close
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            {/* Full-size image (not cropped) */}
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded"
            />

            {/* Title */}
            <h2 className="text-2xl font-bold mt-4">{item.title}</h2>

            {/* Expanded content from Supabase 'content' column */}
            <p className="text-gray-700 mt-2">
              {item.content || item.excerpt}
            </p>

            {/* Audio player */}
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full mt-4" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
