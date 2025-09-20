import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    const initCanvas = () => {
      return new fabric.Canvas(canvasRef.current, {
        height: 400,
        width: 600,
        backgroundColor: 'white',
      });
    };

    const canvasInstance = initCanvas();
    setCanvas(canvasInstance);

    return () => {
      canvasInstance.dispose();
    };
  }, []);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Collaborative Whiteboard</h3>
      <canvas ref={canvasRef} className="border" />
    </div>
  );
};

export default Whiteboard;
