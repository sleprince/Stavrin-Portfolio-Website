"use client"; 
// 👆 Needed in Next.js app router for components that use hooks (useState, etc.)

import { useState } from "react";
import { motion } from "framer-motion"; // for animations 'npm install framer-motion --save'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
// 👆 this comes from shadcn/ui, make sure you've run `npx shadcn@latest add dialog`

// Props = info we pass into the tile for each song
interface SongTileProps {
  title: string;
  description: string;
  image: string;  // URL or /public path
  audio: string;  // URL or /public path
}

export default function SongTile({ title, description, image, audio }: SongTileProps) {
  // Keep track of whether the modal is open
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Song Tile (clickable card) */}
      <motion.div
        whileHover={{ rotate: [0, -2, 2, -2, 2, 0], transition: { duration: 0.4 } }}
        onClick={() => setOpen(true)} // open modal when clicked
        className="p-4 bg-gray-800 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition"
      >
        {/* Tile content */}
        <img src={image} alt={title} className="w-full h-40 object-cover rounded-xl mb-2" />
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </motion.div>

      {/* Modal (Dialog) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>

          {/* Song cover image */}
          <img src={image} alt={title} className="w-full h-48 object-cover rounded-xl mb-4" />

          {/* Description text */}
          <p className="mb-4">{description}</p>

          {/* Audio player */}
          <audio controls className="w-full">
            <source src={audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </DialogContent>
      </Dialog>
    </>
  );
}
