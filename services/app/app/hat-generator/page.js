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
  
  // State for mode
  const [mode, setMode] = useState('hat'); // 'hat' or 'logo'
  
  // Refs
  const hatCanvasRef = useRef(null);
  const compositeCanvasRef = useRef(null);
  const hatImageRef = useRef(null);
  const logoImageRef = useRef(null);
  
  // Add these state variables for logo background options
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('#00FF00');
  const [logoBackgroundEnabled, setLogoBackgroundEnabled] = useState(false);
  
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
    if (!compositeCanvasRef.current || !userImage) return;
    
    const canvas = compositeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load the user image
    const img = new Image();
    img.src = userImage;
    
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the user image
      ctx.drawImage(img, 0, 0);
      
      if (mode === 'hat' && hatCanvas) {
        // Draw the hat on top of the user image
        const hatImg = new Image();
        hatImg.src = hatCanvas;
        
        hatImg.onload = () => {
          // Calculate position based on percentage
          const x = (hatPosition.x / 100) * canvas.width;
          const y = (hatPosition.y / 100) * canvas.height;
          
          // Calculate dimensions based on size percentage
          const width = (hatSize / 100) * canvas.width;
          const height = (width / hatImg.width) * hatImg.height;
          
          // Draw the hat with rotation
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(hatRotation * Math.PI / 180);
          ctx.drawImage(hatImg, -width/2, -height/2, width, height);
          ctx.restore();
          
          // Draw logo on hat if in hat mode and logo exists
          if (logoImageRef.current) {
            const logoImg = new Image();
            logoImg.src = logoImageRef.current.src;
            
            logoImg.onload = () => {
              // Logo positioning relative to hat
              const logoX = x + (logoPosition.x - 50) * width / 100;
              const logoY = y + (logoPosition.y - 50) * height / 100;
              
              // Logo sizing relative to hat
              const logoWidth = (logoSize / 100) * width;
              const logoHeight = (logoWidth / logoImg.width) * logoImg.height;
              
              // Draw the logo with rotation
              ctx.save();
              ctx.translate(logoX, logoY);
              ctx.rotate(logoRotation * Math.PI / 180);
              ctx.drawImage(logoImg, -logoWidth/2, -logoHeight/2, logoWidth, logoHeight);
              ctx.restore();
            };
          }
        };
      } else if (mode === 'logo' && logoImageRef.current) {
        // Draw just the logo on the user image (no hat)
        const logoImg = new Image();
        logoImg.src = logoImageRef.current.src;
        
        logoImg.onload = () => {
          // Calculate position based on percentage
          const x = (logoPosition.x / 100) * canvas.width;
          const y = (logoPosition.y / 100) * canvas.height;
          
          // Calculate dimensions based on size percentage
          const width = (logoSize / 100) * canvas.width;
          const height = (width / logoImg.width) * logoImg.height;
          
          // Draw background circle if enabled
          if (logoBackgroundEnabled) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, width/2, 0, Math.PI * 2);
            ctx.fillStyle = logoBackgroundColor;
            ctx.fill();
            ctx.restore();
          }
          
          // Draw the logo with rotation
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(logoRotation * Math.PI / 180);
          ctx.drawImage(logoImg, -width/2, -height/2, width, height);
          ctx.restore();
        };
      }
    };
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
  
  const handleDrag = (e, info) => {
    // Get the dimensions of the container
    const container = e.target.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Calculate the new position as a percentage of the container
    const x = (info.point.x - rect.left) / rect.width * 100;
    const y = (info.point.y - rect.top) / rect.height * 100;
    
    // Update the position state based on the current mode
    if (mode === 'hat') {
      setHatPosition({ x, y });
    } else {
      setLogoPosition({ x, y });
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
  
  // Toggle mode
  const toggleMode = () => {
    setMode(mode === 'hat' ? 'logo' : 'hat');
  };
  
  // Update the tab labels based on the current mode
  const getTabLabels = () => {
    if (mode === 'hat') {
      return {
        customize: 'Customize Hat',
        position: 'Position Hat'
      };
    } else {
      return {
        customize: 'Customize Logo',
        position: 'Position Logo'
      };
    }
  };
  
  // Use this in your UI
  const tabLabels = getTabLabels();
  
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
            {/* Mode Toggle */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-green-500/70">
                Customization Mode
              </label>
              <div className="flex border border-green-500/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setMode('hat')}
                  className={`flex-1 py-2 px-4 ${
                    mode === 'hat' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-black text-green-500/50 hover:text-green-500/70'
                  }`}
                >
                  Hat Mode
                </button>
                <button
                  onClick={() => setMode('logo')}
                  className={`flex-1 py-2 px-4 ${
                    mode === 'logo' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-black text-green-500/50 hover:text-green-500/70'
                  }`}
                >
                  Logo Mode
                </button>
              </div>
            </div>
            
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
                {tabLabels.customize}
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
                {tabLabels.position}
              </button>
            </div>
            
            {/* Customize Hat Controls */}
            <div className={editMode === 'customize' ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold mb-4 text-green-500">
                {mode === 'hat' ? 'Customize Hat' : 'Customize Logo'}
              </h2>
              
              {/* Hat customization options - Only show in hat mode */}
              {mode === 'hat' && (
                <>
                  {/* Hat color picker */}
                  <div className="mb-6">
                    <label className="block text-sm mb-2 text-green-500/70">
                      Hat Color
                    </label>
                    <input
                      type="color"
                      value={hatColor}
                      onChange={(e) => setHatColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                  
                  {/* Hat text input */}
                  <div className="mb-6">
                    <label className="block text-sm mb-2 text-green-500/70">
                      Hat Text
                    </label>
                    <input
                      type="text"
                      value={hatText}
                      onChange={(e) => setHatText(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-green-500/30 rounded text-green-500"
                      placeholder="Enter text for hat"
                    />
                  </div>
                  
                  {/* Hat flip toggle */}
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hatFlipped}
                        onChange={() => setHatFlipped(!hatFlipped)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full ${hatFlipped ? 'bg-green-500' : 'bg-gray-600'} relative transition-colors`}>
                        <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${hatFlipped ? 'right-1' : 'left-1'}`}></div>
                      </div>
                      <span className="text-green-500/70">Flip Hat</span>
                    </label>
                  </div>
                  
                  {/* Logo upload for hat */}
                  <div className="mb-6">
                    <label className="block text-sm mb-2 text-green-500/70">
                      Hat Logo (Optional)
                    </label>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-4 py-2 border border-green-500/30 rounded-lg bg-black text-green-500 hover:border-green-500/60 transition-colors text-center">
                          {logoImageRef.current ? 'Change Logo' : 'Upload Logo'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      
                      {logoImageRef.current && (
                        <button
                          onClick={() => {
                            logoImageRef.current = null;
                            updateHatCanvas();
                          }}
                          className="px-3 py-2 border border-red-500/30 rounded-lg bg-black text-red-500 hover:border-red-500/60 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {logoImageRef.current && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={logoImageRef.current.src} 
                          alt="Logo" 
                          className="h-16 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Logo size slider - Only show when logo is uploaded */}
                  {logoImageRef.current && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2 text-green-500/70">
                        Logo Size: {logoSize}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Logo position controls - Only show when logo is uploaded */}
                  {logoImageRef.current && (
                    <>
                      <div className="mb-6">
                        <label className="block text-sm mb-2 text-green-500/70">
                          Logo Position X: {logoPosition.x.toFixed(1)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={logoPosition.x}
                          onChange={(e) => setLogoPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm mb-2 text-green-500/70">
                          Logo Position Y: {logoPosition.y.toFixed(1)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.1"
                          value={logoPosition.y}
                          onChange={(e) => setLogoPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
              
              {/* Logo customization options - Only show in logo mode */}
              {mode === 'logo' && (
                <>
                  {/* Logo upload for logo mode */}
                  <div className="mb-6">
                    <label className="block text-sm mb-2 text-green-500/70">
                      Upload Logo
                    </label>
                    
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-4 py-2 border border-green-500/30 rounded-lg bg-black text-green-500 hover:border-green-500/60 transition-colors text-center">
                          {logoImageRef.current ? 'Change Logo' : 'Upload Logo'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      
                      {logoImageRef.current && (
                        <button
                          onClick={() => {
                            logoImageRef.current = null;
                            updateHatCanvas();
                          }}
                          className="px-3 py-2 border border-red-500/30 rounded-lg bg-black text-red-500 hover:border-red-500/60 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    {logoImageRef.current && (
                      <div className="mt-2 flex justify-center">
                        <img 
                          src={logoImageRef.current.src} 
                          alt="Logo" 
                          className="h-16 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Logo size slider - Only show when logo is uploaded */}
                  {logoImageRef.current && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2 text-green-500/70">
                        Logo Size: {logoSize}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Logo rotation slider - Only show when logo is uploaded */}
                  {logoImageRef.current && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2 text-green-500/70">
                        Logo Rotation: {logoRotation}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={logoRotation}
                        onChange={(e) => setLogoRotation(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {/* Background color option for logo */}
                  {logoImageRef.current && (
                    <div className="mb-6">
                      <label className="block text-sm mb-2 text-green-500/70">
                        Background Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={logoBackgroundColor}
                          onChange={(e) => setLogoBackgroundColor(e.target.value)}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={logoBackgroundEnabled}
                            onChange={() => setLogoBackgroundEnabled(!logoBackgroundEnabled)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-6 rounded-full ${logoBackgroundEnabled ? 'bg-green-500' : 'bg-gray-600'} relative transition-colors`}>
                            <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${logoBackgroundEnabled ? 'right-1' : 'left-1'}`}></div>
                          </div>
                          <span className="text-green-500/70 whitespace-nowrap">Enable Background</span>
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Position Controls */}
            <div className={editMode === 'position' ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold mb-4 text-green-500">
                {mode === 'hat' ? 'Position Hat' : 'Position Logo'}
              </h2>
              
              <p className="text-green-500/70 mb-6">
                {mode === 'hat' 
                  ? 'Drag the hat directly on the image or use the controls below to adjust'
                  : 'Drag the logo directly on the image or use the controls below to adjust'
                }
              </p>
              
              {/* Size slider */}
              <div className="mb-6">
                <label className="block text-sm mb-2 text-green-500/70">
                  Size: {mode === 'hat' ? hatSize : logoSize}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={mode === 'hat' ? hatSize : logoSize}
                  onChange={(e) => {
                    if (mode === 'hat') {
                      setHatSize(parseInt(e.target.value));
                    } else {
                      setLogoSize(parseInt(e.target.value));
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              {/* Rotation slider */}
              <div className="mb-6">
                <label className="block text-sm mb-2 text-green-500/70">
                  Rotation: {mode === 'hat' ? hatRotation : logoRotation}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={mode === 'hat' ? hatRotation : logoRotation}
                  onChange={(e) => {
                    if (mode === 'hat') {
                      setHatRotation(parseInt(e.target.value));
                    } else {
                      setLogoRotation(parseInt(e.target.value));
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              {/* X Position slider */}
              <div className="mb-6">
                <label className="block text-sm mb-2 text-green-500/70">
                  X Position: {mode === 'hat' ? hatPosition.x.toFixed(1) : logoPosition.x.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={mode === 'hat' ? hatPosition.x : logoPosition.x}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (mode === 'hat') {
                      setHatPosition(prev => ({ ...prev, x: value }));
                    } else {
                      setLogoPosition(prev => ({ ...prev, x: value }));
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              {/* Y Position slider */}
              <div className="mb-6">
                <label className="block text-sm mb-2 text-green-500/70">
                  Y Position: {mode === 'hat' ? hatPosition.y.toFixed(1) : logoPosition.y.toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={mode === 'hat' ? hatPosition.y : logoPosition.y}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (mode === 'hat') {
                      setHatPosition(prev => ({ ...prev, y: value }));
                    } else {
                      setLogoPosition(prev => ({ ...prev, y: value }));
                    }
                  }}
                  className="w-full"
                />
              </div>
              
              {/* Reset Position button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (mode === 'hat') {
                      setHatPosition({ x: 50, y: 50 });
                      setHatRotation(0);
                      setHatSize(50);
                    } else {
                      setLogoPosition({ x: 50, y: 50 });
                      setLogoRotation(0);
                      setLogoSize(30);
                    }
                  }}
                  className="w-full px-4 py-2 border border-green-500/30 rounded-lg bg-black text-green-500 hover:border-green-500/60 transition-colors"
                >
                  Reset Position
                </button>
              </div>
            </div>
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
                  
                  {/* Hat overlay - Only show in hat mode */}
                  {mode === 'hat' && hatCanvas && (
                    <div 
                      className={`absolute top-0 left-0 w-full h-full ${editMode === 'position' ? '' : 'pointer-events-none'}`}
                    >
                      <div 
                        className="absolute"
                        style={{
                          left: `${hatPosition.x}%`,
                          top: `${hatPosition.y}%`,
                          transform: `translate(-50%, -50%) rotate(${hatRotation}deg)`,
                          width: `${hatSize}%`,
                          height: 'auto'
                        }}
                      >
                        <img 
                          src={hatCanvas} 
                          alt="Hat" 
                          className="w-full h-auto"
                        />
                        
                        {/* Logo on hat - Only in hat mode */}
                        {logoImageRef.current && (
                          <div 
                            className="absolute"
                            style={{
                              left: `${logoPosition.x}%`,
                              top: `${logoPosition.y}%`,
                              transform: `translate(-50%, -50%) rotate(${logoRotation}deg)`,
                              width: `${logoSize}%`,
                              height: 'auto'
                            }}
                          >
                            <img 
                              src={logoImageRef.current.src} 
                              alt="Logo" 
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Logo overlay - Only show in logo mode */}
                  {mode === 'logo' && logoImageRef.current && (
                    <div 
                      className={`absolute top-0 left-0 w-full h-full ${editMode === 'position' ? '' : 'pointer-events-none'}`}
                    >
                      <div 
                        className="absolute"
                        style={{
                          left: `${logoPosition.x}%`,
                          top: `${logoPosition.y}%`,
                          transform: `translate(-50%, -50%) rotate(${logoRotation}deg)`,
                          width: `${logoSize}%`,
                          height: 'auto'
                        }}
                      >
                        <img 
                          src={logoImageRef.current.src} 
                          alt="Logo" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Draggable area */}
                  {editMode === 'position' && (
                    <motion.div
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ 
                        touchAction: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      drag={true}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDrag={handleDrag}
                    >
                      {/* This div is just for drag detection */}
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
                  {mode === 'hat' && hatCanvas ? (
                    <>
                      <img 
                        src={hatCanvas} 
                        alt="Hat Preview" 
                        className="w-48 h-auto mb-6"
                      />
                      <p className="text-green-500/50 text-center mb-6">
                        Your hat is ready! Upload a profile image to position it.
                      </p>
                    </>
                  ) : mode === 'logo' && logoImageRef.current ? (
                    <>
                      <img 
                        src={logoImageRef.current.src} 
                        alt="Logo Preview" 
                        className="w-48 h-auto mb-6"
                      />
                      <p className="text-green-500/50 text-center mb-6">
                        Your logo is ready! Upload a profile image to position it.
                      </p>
                    </>
                  ) : (
                    <p className="text-green-500/50 text-center mb-6">
                      {mode === 'hat' ? 'Customize your hat and upload a profile image.' : 'Upload a logo and a profile image.'}
                    </p>
                  )}
                  
                  <button
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="px-6 py-3 border border-green-500/30 rounded-lg bg-black text-green-500 hover:border-green-500/60 transition-colors"
                  >
                    Upload Profile Image
                  </button>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUserImageUpload}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}