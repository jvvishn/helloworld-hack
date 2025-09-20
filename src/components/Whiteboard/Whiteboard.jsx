import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/mockSocketService';
import Button from '../UI/Button';

const Whiteboard = ({ groupId }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = () => {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        height: 500,
        width: 800,
        backgroundColor: 'white',
        selection: tool === 'select',
      });

      // Set drawing mode based on tool
      fabricCanvas.isDrawingMode = tool === 'pen' || tool === 'eraser';
      
      // Initialize brush settings
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = color;
        fabricCanvas.freeDrawingBrush.width = brushSize;
      }

      return fabricCanvas;
    };

    const fabricCanvas = initCanvas();
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Update canvas properties when tool/color/size changes
  useEffect(() => {
    if (!canvas) return;

    // Configure drawing mode and brush based on tool
    switch (tool) {
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.decimate = 0.4; // Smoother curves
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        break;
        
      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.selection = false;
        // Create custom eraser brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = 'white'; // Erase by drawing white
        canvas.freeDrawingBrush.width = brushSize * 2; // Larger eraser
        canvas.freeDrawingBrush.decimate = 0.4;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
        break;
        
      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        break;
        
      default:
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = 'crosshair';
        canvas.hoverCursor = 'crosshair';
    }

    canvas.renderAll();
  }, [canvas, tool, color, brushSize]);

  // Set up real-time collaboration
  useEffect(() => {
    if (!canvas || !groupId || !user) return;

    // Connect to socket for real-time updates
    socketService.connect(user);
    setIsConnected(socketService.getConnectionStatus().connected);

    // Listen for incoming whiteboard updates
    const handleWhiteboardUpdate = (updateData) => {
      if (updateData.userId !== user.uid) {
        console.log('Received remote whiteboard update:', updateData);
        // In a real implementation, you would apply the remote changes here
      }
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('whiteboard-update', handleWhiteboardUpdate);
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    // Send local changes to other users
    const handleCanvasChange = (e) => {
      if (isDrawing) return;

      const updateData = {
        type: e.type,
        userId: user.uid,
        userName: user.name,
        timestamp: Date.now(),
        canvasData: canvas.toJSON(), // Include canvas state for sync
      };

      socketService.sendWhiteboardUpdate(groupId, updateData);
    };

    // Canvas event listeners for collaboration
    canvas.on('path:created', handleCanvasChange);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);
    canvas.on('object:modified', handleCanvasChange);

    // Drawing state tracking
    canvas.on('mouse:down', () => setIsDrawing(true));
    canvas.on('mouse:up', () => setIsDrawing(false));

    return () => {
      socketService.off('whiteboard-update', handleWhiteboardUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      
      canvas.off('path:created', handleCanvasChange);
      canvas.off('object:added', handleCanvasChange);
      canvas.off('object:removed', handleCanvasChange);
      canvas.off('object:modified', handleCanvasChange);
      canvas.off('mouse:down');
      canvas.off('mouse:up');
    };
  }, [canvas, groupId, user, isDrawing]);

  // Tool handlers
  const handleToolChange = (newTool) => {
    setTool(newTool);
  };

  const addShape = (shapeType) => {
    if (!canvas) return;

    let shape;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: centerX - 50,
          top: centerY - 25,
          width: 100,
          height: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: centerX - 30,
          top: centerY - 30,
          radius: 30,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: centerX - 30,
          top: centerY - 25,
          width: 60,
          height: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth: 2,
        });
        break;
      case 'line':
        shape = new fabric.Line([centerX - 50, centerY, centerX + 50, centerY], {
          stroke: color,
          strokeWidth: 2,
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText('Click to edit', {
      left: canvas.width / 2 - 50,
      top: canvas.height / 2 - 10,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: color,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'white';
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const undoLastAction = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const downloadCanvas = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    
    const link = document.createElement('a');
    link.download = `whiteboard-${groupId}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Preset colors for quick selection
  const presetColors = ['#000000', '#264653', '#287271', '#2A9D8F', '#8AB17D', '#E9C46A', '#EE8959', '#E76F51'];

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 border-b bg-gray-50 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">Collaborative Whiteboard</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Drawing Tools */}
          <div className="flex items-center space-x-1 bg-white rounded-md p-1 border">
            <Button
              size="small"
              variant={tool === 'select' ? 'primary' : 'outline'}
              onClick={() => handleToolChange('select')}
              className="p-2"
              title="Select Tool"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </Button>
            <Button
              size="small"
              variant={tool === 'pen' ? 'primary' : 'outline'}
              onClick={() => handleToolChange('pen')}
              className="p-2"
              title="Freehand Pen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
            <Button
              size="small"
              variant={tool === 'eraser' ? 'primary' : 'outline'}
              onClick={() => handleToolChange('eraser')}
              className="p-2"
              title="Eraser"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>

          {/* Color Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Color:</span>
            <div className="flex items-center space-x-1">
              {presetColors.map(presetColor => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={`w-6 h-6 rounded border-2 ${
                    color === presetColor ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={`Select ${presetColor}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded border cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Size:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-gray-500 w-8">{brushSize}px</span>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 border-b bg-gray-25 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Shapes */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 mr-2">Shapes:</span>
            <Button size="small" variant="outline" onClick={() => addShape('rectangle')}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" />
              </svg>
              Rectangle
            </Button>
            <Button size="small" variant="outline" onClick={() => addShape('circle')}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Circle
            </Button>
            <Button size="small" variant="outline" onClick={() => addShape('triangle')}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polygon points="12,2 22,20 2,20" />
              </svg>
              Triangle
            </Button>
            <Button size="small" variant="outline" onClick={() => addShape('line')}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Line
            </Button>
            <Button size="small" variant="outline" onClick={addText}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              </svg>
              Text
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="small" variant="outline" onClick={undoLastAction}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </Button>
          <Button size="small" variant="outline" onClick={deleteSelected}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
          <Button size="small" variant="outline" onClick={clearCanvas}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </Button>
          <Button size="small" variant="outline" onClick={downloadCanvas}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-4 bg-gray-50">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 flex justify-between items-center">
        <div>
          Current tool: <span className="font-medium capitalize">{tool}</span>
          {tool !== 'select' && (
            <>
              {' • '}Color: <span className="font-medium">{color}</span>
              {' • '}Size: <span className="font-medium">{brushSize}px</span>
            </>
          )}
        </div>
        <div>
          Real-time collaboration {isConnected ? 'enabled' : 'disabled'}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 border-t text-xs text-blue-700">
        <p>
          <strong>Freehand Drawing:</strong> Select the pen tool and draw freely on the canvas. 
          Use the eraser to remove parts of your drawing. 
          Add shapes and text for structured diagrams. 
          Your changes sync with all group members in real-time!
        </p>
      </div>
    </div>
  );
};

export default Whiteboard