import React, { useState } from "react";

function App() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleWheel = (event) => {
    event.preventDefault();
    const newScale = scale + event.deltaY * -0.01;
    setScale(newScale);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    const startX = event.pageX - position.x;
    const startY = event.pageY - position.y;

    const handleMouseMove = (event) => {
      event.preventDefault();
      setPosition({
        x: event.pageX - startX,
        y: event.pageY - startY,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", handleMouseMove);
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "top left",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Your content here */}
      </div>
    </div>
  );
}

export default App;
