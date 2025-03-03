'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlitchText } from '../../components/GlitchText';
import { GlowBorder } from '../../components/GlowBorder';
import { motion } from 'framer-motion';

export default function HatGenerator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get token parameters from URL if available
  const tokenName = searchParams.get('name') || '8==D';
  const tokenColor = searchParams.get('color') || '#FF6B35';
  const isCreator = searchParams.get('creator') === 'true';
  
  // State for images
  const [userImage, setUserImage] = useState(null);
  const [hatCanvas, setHatCanvas] = useState(null);
  
  // State for hat customization
  const [hatColor, setHatColor] = useState(tokenColor);
  const [hatText, setHatText] = useState(tokenName);
  
  // State for hat positioning
  const [hatPosition, setHatPosition] = useState({ x: 50, y: 20 });
  const [hatSize, setHatSize] = useState(50);
  const [hatRotation, setHatRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // State for editing modes
  const [editMode, setEditMode] = useState('customize'); // 'customize' or 'position'
  
  // State for results
  const [resultImage, setResultImage] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  
  // State for hat flipping
  const [hatFlipped, setHatFlipped] = useState(false);
  
  // State for logo
  const [hatLogo, setHatLogo] = useState(null);
  const [logoPosition, setLogoPosition] = useState({ x: 50, y: 50 });
  const [logoSize, setLogoSize] = useState(30);
  const [logoRotation, setLogoRotation] = useState(0);
  
  // Refs
  const hatCanvasRef = useRef(null);
  const compositeCanvasRef = useRef(null);
  const hatImageRef = useRef(null);
  const logoImageRef = useRef(null);
  
  // Load default hat image on mount
  useEffect(() => {
    const hatImg = new Image();
    hatImg.src = '/images/default-hat.png';
    hatImg.onload = () => {
      hatImageRef.current = hatImg;
      updateHatCanvas();
    };
  }, []);
  
  // Update hat canvas when customization changes
  useEffect(() => {
    if (hatImageRef.current) {
      updateHatCanvas();
    }
  }, [hatColor, hatText, hatFlipped, logoPosition, logoSize, logoRotation]);
  
  // Update composite image when user image or hat changes
  useEffect(() => {
    if (userImage && hatCanvas) {
      updateCompositeImage();
    }
  }, [userImage, hatCanvas, hatPosition, hatSize, hatRotation]);
  
  // Function to update the hat canvas with color and text
  const updateHatCanvas = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match hat image
    canvas.width = hatImageRef.current.width;
    canvas.height = hatImageRef.current.height;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply flip if needed
    if (hatFlipped) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    // Draw hat
    ctx.drawImage(hatImageRef.current, 0, 0);
    
    // Reset transformation if flipped
    if (hatFlipped) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // Apply color overlay
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = hatColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Add text to hat
    if (hatText) {
      // Calculate a good position for text based on hat dimensions
      const textX = canvas.width * 0.5;
      const textY = canvas.height * 0.45; // Slightly above center
      
      // Set text style
      ctx.font = 'bold 24px "Pixelify Mono"';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Draw text
      ctx.fillText(hatText, textX, textY);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
    }
    
    // Add logo AFTER coloring and text, so it remains unadulterated
    if (logoImageRef.current) {
      // Save the current context state
      ctx.save();
      
      // Move to the logo position
      const logoX = (canvas.width * logoPosition.x) / 100;
      const logoY = (canvas.height * logoPosition.y) / 100;
      
      // Calculate logo dimensions
      const logoWidth = (canvas.width * logoSize) / 100;
      const logoHeight = (logoWidth / logoImageRef.current.width) * logoImageRef.current.height;
      
      // Translate to the logo position for rotation
      ctx.translate(logoX, logoY);
      ctx.rotate((logoRotation * Math.PI) / 180);
      
      // Draw the logo centered at the position
      ctx.drawImage(
        logoImageRef.current,
        -logoWidth / 2,
        -logoHeight / 2,
        logoWidth,
        logoHeight
      );
      
      // Restore the context state
      ctx.restore();
    }
    
    setHatCanvas(canvas.toDataURL('image/png'));
  };
  
  // Function to update the composite image
  const updateCompositeImage = () => {
    if (!compositeCanvasRef.current || !userImage || !hatCanvas) return;
    
    const canvas = compositeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load user image
    const userImg = new Image();
    userImg.onload = () => {
      // Set canvas size to match user image
      canvas.width = userImg.width;
      canvas.height = userImg.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw user image
      ctx.drawImage(userImg, 0, 0);
      
      // Load hat image
      const hatImg = new Image();
      hatImg.onload = () => {
        // Calculate hat dimensions based on size percentage
        const hatWidth = (canvas.width * hatSize) / 100;
        const hatHeight = (hatWidth / hatImg.width) * hatImg.height;
        
        // Calculate position based on percentages
        const x = (canvas.width * hatPosition.x) / 100 - hatWidth / 2;
        const y = (canvas.height * hatPosition.y) / 100 - hatHeight / 2;
        
        // Save context for rotation
        ctx.save();
        
        // Move to center of where hat should be
        ctx.translate(x + hatWidth / 2, y + hatHeight / 2);
        
        // Rotate
        ctx.rotate((hatRotation * Math.PI) / 180);
        
        // Draw hat (centered at origin now)
        ctx.drawImage(hatImg, -hatWidth / 2, -hatHeight / 2, hatWidth, hatHeight);
        
        // Restore context
        ctx.restore();
        
        // Update result image
        setResultImage(canvas.toDataURL('image/png'));
      };
      hatImg.src = hatCanvas;
    };
    userImg.src = userImage;
  };
  
  // Handle user image upload
  const handleUserImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result);
        // Switch to positioning mode after upload
        setEditMode('position');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          logoImageRef.current = img;
          updateHatCanvas();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle hat drag
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const handleDrag = (_, info) => {
    if (compositeCanvasRef.current && userImage) {
      const canvas = compositeCanvasRef.current;
      
      // Convert pixel position to percentage
      const newX = (info.point.x / canvas.clientWidth) * 100;
      const newY = (info.point.y / canvas.clientHeight) * 100;
      
      // Clamp values to stay within canvas
      const clampedX = Math.max(0, Math.min(100, newX));
      const clampedY = Math.max(0, Math.min(100, newY));
      
      setHatPosition({ x: clampedX, y: clampedY });
    }
  };
  
  // Generate share URL for creators
  const generateShareUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('name', hatText);
    params.set('color', hatColor);
    
    const shareUrl = `${baseUrl}?${params.toString()}`;
    setShareUrl(shareUrl);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard!');
  };
  
  // Handle download
  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'my-token-hat.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <GlitchText>REP YOUR CULT</GlitchText>
          </h1>
          <p className="text-xl text-green-500/80">
            {isCreator ? "Create a custom hat for your token" : "Give your PFP a custom hat to pledge your loyalty"}
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Mode Switcher */}
            <div className="flex border border-green-500/30 rounded-lg overflow-hidden mb-6">
              <button
                onClick={() => setEditMode('customize')}
                className={`flex-1 py-3 px-4 ${
                  editMode === 'customize' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-black text-green-500/50 hover:bg-green-500/10'
                }`}
              >
                Customize Hat
              </button>
              <button
                onClick={() => setEditMode('position')}
                className={`flex-1 py-3 px-4 ${
                  editMode === 'position' 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-black text-green-500/50 hover:bg-green-500/10'
                }`}
                disabled={!userImage}
              >
                Position Hat
              </button>
            </div>
            
            {/* Customize Hat Controls */}
            {editMode === 'customize' && (
              <div className="border border-green-500/30 rounded-lg p-6 bg-black/20 space-y-6">
                <h3 className="text-xl font-bold mb-2">Customize Hat</h3>
                
                {/* Hat Preview */}
                <div className="flex justify-center mb-6">
                  {hatCanvas && (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <img 
                        src={hatCanvas} 
                        alt="Hat Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                
                {/* Hat Color */}
                <div>
                  <label className="block text-sm mb-2 text-green-500/70">Hat Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={hatColor}
                      onChange={(e) => setHatColor(e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={hatColor}
                      onChange={(e) => setHatColor(e.target.value)}
                      className="bg-black border border-green-500/30 rounded p-2 text-green-500 w-full"
                    />
                  </div>
                </div>
                
                {/* Hat Text */}
                <div>
                  <label className="block text-sm mb-2 text-green-500/70">Hat Text</label>
                  <input
                    type="text"
                    value={hatText}
                    onChange={(e) => setHatText(e.target.value)}
                    placeholder="Your token name"
                    className="bg-black border border-green-500/30 rounded p-2 text-green-500 w-full"
                  />
                </div>
                
                {/* Upload Profile Image Button */}
                <div className="pt-4">
                  <p className="text-sm mb-3 text-green-500/70">Ready to position your hat?</p>
                  <GlowBorder>
                    <label className="block w-full py-3 bg-black text-green-500 rounded-lg text-center cursor-pointer">
                      Upload Profile Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUserImageUpload}
                        className="hidden"
                      />
                    </label>
                  </GlowBorder>
                </div>
                
                {/* Upload Logo Button */}
                <div className="pt-4">
                  <p className="text-sm mb-3 text-green-500/70">Ready to add a logo?</p>
                  <GlowBorder>
                    <label className="block w-full py-3 bg-black text-green-500 rounded-lg text-center cursor-pointer">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </GlowBorder>
                </div>
                
                {/* Generate Share URL (Creator Mode) */}
                {isCreator && (
                  <div className="pt-4">
                    <GlowBorder>
                      <button
                        onClick={generateShareUrl}
                        className="w-full py-3 bg-black text-green-500 rounded-lg"
                      >
                        Generate Share URL
                      </button>
                    </GlowBorder>
                    
                    {shareUrl && (
                      <div className="mt-3">
                        <p className="text-sm mb-1 text-green-500/70">Share URL (copied to clipboard):</p>
                        <div className="bg-black/50 border border-green-500/30 p-2 rounded text-xs break-all">
                          {shareUrl}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Hat Orientation */}
                <div className="mb-4">
                  <label className="block text-sm mb-2 text-green-500/70">Hat Orientation</label>
                  <button
                    onClick={() => setHatFlipped(!hatFlipped)}
                    className="px-4 py-2 border border-green-500/30 rounded-lg bg-black text-green-500 hover:border-green-500/60 transition-colors"
                  >
                    {hatFlipped ? "Flip Right" : "Flip Left"}
                  </button>
                </div>
                
                {/* Logo customization options - only show if a logo is uploaded */}
                {logoImageRef.current && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm mb-2 text-green-500/70">Logo Size: {logoSize}%</label>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm mb-2 text-green-500/70">Logo Position X: {logoPosition.x}%</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={logoPosition.x}
                        onChange={(e) => setLogoPosition({...logoPosition, x: parseInt(e.target.value)})}
                        className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm mb-2 text-green-500/70">Logo Position Y: {logoPosition.y}%</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={logoPosition.y}
                        onChange={(e) => setLogoPosition({...logoPosition, y: parseInt(e.target.value)})}
                        className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm mb-2 text-green-500/70">Logo Rotation: {logoRotation}°</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={logoRotation}
                        onChange={(e) => setLogoRotation(parseInt(e.target.value))}
                        className="w-full h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Position Hat Controls */}
            {editMode === 'position' && (
              <div className="border border-green-500/30 rounded-lg p-6 bg-black/20 space-y-6">
                <h3 className="text-xl font-bold mb-2">Position Hat</h3>
                <p className="text-sm text-green-500/70 mb-4">
                  Drag the hat directly on the image or use the controls below to adjust
                </p>
                
                {/* Size Slider */}
                <div>
                  <label className="block text-sm mb-2 text-green-500/70">Size: {hatSize}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={hatSize}
                    onChange={(e) => setHatSize(parseInt(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
                
                {/* Rotation Slider */}
                <div>
                  <label className="block text-sm mb-2 text-green-500/70">Rotation: {hatRotation}°</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={hatRotation}
                    onChange={(e) => setHatRotation(parseInt(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
                
                {/* Position Values */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-green-500/70">X Position: {hatPosition.x.toFixed(1)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={hatPosition.x}
                      onChange={(e) => setHatPosition({...hatPosition, x: parseFloat(e.target.value)})}
                      className="w-full accent-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-green-500/70">Y Position: {hatPosition.y.toFixed(1)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={hatPosition.y}
                      onChange={(e) => setHatPosition({...hatPosition, y: parseFloat(e.target.value)})}
                      className="w-full accent-green-500"
                    />
                  </div>
                </div>
                
                {/* Download Button */}
                {resultImage && (
                  <div className="pt-4">
                    <GlowBorder>
                      <button
                        onClick={handleDownload}
                        className="w-full py-3 bg-black text-green-500 rounded-lg"
                      >
                        Download Image
                      </button>
                    </GlowBorder>
                  </div>
                )}
                
                {/* Back to Customize */}
                <div>
                  <button
                    onClick={() => setEditMode('customize')}
                    className="text-green-500/70 hover:text-green-500 text-sm"
                  >
                    ← Back to Hat Customization
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Preview */}
          <div className="border border-green-500/30 rounded-lg p-6 bg-black/20">
            <h3 className="text-xl font-bold mb-6 text-center">Preview</h3>
            
            <div className="relative w-full aspect-square flex items-center justify-center">
              {userImage ? (
                <div className="relative w-full h-full">
                  {/* Base image */}
                  <img 
                    src={userImage} 
                    alt="Profile" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Draggable hat overlay (only in position mode) */}
                  {editMode === 'position' && hatCanvas && (
                    <motion.div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ 
                        touchAction: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      drag={editMode === 'position'}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDrag={handleDrag}
                    >
                      <div 
                        className="absolute"
                        style={{
                          left: `${hatPosition.x}%`,
                          top: `${hatPosition.y}%`,
                          transform: `translate(-50%, -50%) rotate(${hatRotation}deg)`,
                          width: `${hatSize}%`,
                          height: 'auto',
                          pointerEvents: 'none'
                        }}
                      >
                        <img 
                          src={hatCanvas} 
                          alt="Hat" 
                          className="w-full h-auto"
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Hidden canvas for final image composition */}
                  <canvas 
                    ref={compositeCanvasRef} 
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-green-500/30 flex flex-col items-center justify-center p-6">
                  {hatCanvas ? (
                    <>
                      <img 
                        src={hatCanvas} 
                        alt="Hat Preview" 
                        className="w-48 h-auto mb-6"
                      />
                      <p className="text-green-500/50 text-center">
                        Your hat is ready! Upload a profile image to position it.
                      </p>
                    </>
                  ) : (
                    <p className="text-green-500/50">
                      Loading hat template...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}