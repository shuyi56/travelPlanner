import React from "react";

const ImageCollage = ({ images, height = 120, width = 800 }) => {
  if (!images?.length) return null;

  // Golden ratio
  const phi = 1.618;

  // Custom layouts using golden ratio for 3 and 4 images
  // For 2 images: each on its own row, but imageIndex must be correct
  const layouts = {
    1: [["100%"]],
    2: [["100%"], ["100%"]],
    3: [[`${100 * (phi / (1 + phi))}%`, `${100 * (1 / (1 + phi))}%`], ["100%"]],
    4: [
      [`${100 * (phi / (1 + phi))}%`, `${100 * (1 / (1 + phi))}%`],
      ["50%", "50%"],
    ],
  };

  const layout = layouts[Math.min(images.length, 4)] || layouts[4];

  return (
    <div
      style={{
        height,
        width,
        minWidth: width,
        maxWidth: width,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {layout.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            height: `${100 / layout.length}%`,
            gap: 1,
            paddingBottom:0,
            paddingTop:0,
          }}
        >
          {row.map((cellWidth, j) => {
            // Fix for 1 and 2 images: always use index i for each row
            let imageIndex;
            if (images.length === 1) {
              imageIndex = 0;
            } else if (images.length === 2) {
              imageIndex = i;
            } else if (images.length === 3) {
              imageIndex = row.length === 1 ? 2 : j;
            } else if (images.length === 4) {
              imageIndex = i * 2 + j;
            } else {
              imageIndex = row.length === 1 ? 2 : i * 2 + j;
            }
            if (imageIndex >= images.length) return null;
            const photoUrl = images[imageIndex].thumbUrl || images[imageIndex];
            return (
              <div
                key={j}
                style={{
                  width: cellWidth,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={photoUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ImageCollage;
