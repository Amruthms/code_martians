// Lazy imports to prevent duplicate registrations during hot reload
let cocoSsd: typeof import('@tensorflow-models/coco-ssd') | null = null;
let tf: typeof import('@tensorflow/tfjs') | null = null;

export interface Detection {
  className: string;
  score: number;
  bbox: [number, number, number, number];
}

export interface HelmetDetectionResult {
  personDetected: boolean;
  helmetDetected: boolean;
  confidence: number;
  detections: Detection[];
}

// Global singleton pattern - survives hot module reloads
declare global {
  interface Window {
    __HELMET_DETECTION_MODEL__?: any;
    __TF_INITIALIZED__?: boolean;
  }
}

let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

async function initializeTensorFlow(): Promise<void> {
  // Check if already initialized globally
  if (typeof window !== 'undefined' && window.__TF_INITIALIZED__) {
    return;
  }
  
  try {
    // Suppress TensorFlow.js warnings about duplicate registrations during development
    if (typeof window !== 'undefined' && !window.__TF_INITIALIZED__) {
      console.info(
        '%c🧠 TensorFlow.js Initializing',
        'color: #FF6F00; font-weight: bold;',
        '\nℹ️ You may see warnings about duplicate kernel registrations during development.',
        '\nThese are harmless and expected with hot module replacement.',
        '\nSee TENSORFLOW_WARNINGS_INFO.md for details.'
      );
    }
    
    // Lazy load TensorFlow
    if (!tf) {
      tf = await import('@tensorflow/tfjs');
    }
    
    // Only initialize once
    await tf.ready();
    
    if (typeof window !== 'undefined') {
      window.__TF_INITIALIZED__ = true;
      console.info(
        '%c✅ TensorFlow.js Ready',
        'color: #4CAF50; font-weight: bold;',
        '\nBackend:', tf.getBackend()
      );
    }
  } catch (error) {
    console.error('TensorFlow.js initialization error:', error);
  }
}

export async function loadModel(): Promise<void> {
  // Check if model is already loaded globally
  if (typeof window !== 'undefined' && window.__HELMET_DETECTION_MODEL__) {
    return;
  }
  
  // Prevent multiple simultaneous initializations
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }
  
  isInitializing = true;
  
  initializationPromise = (async () => {
    try {
      await initializeTensorFlow();
      
      console.info(
        '%c📦 Loading COCO-SSD Detection Model...',
        'color: #2196F3; font-weight: bold;'
      );
      
      // Lazy load COCO-SSD
      if (!cocoSsd) {
        cocoSsd = await import('@tensorflow-models/coco-ssd');
      }
      
      // Load and store model globally
      const loadedModel = await cocoSsd.load();
      
      if (typeof window !== 'undefined') {
        window.__HELMET_DETECTION_MODEL__ = loadedModel;
      }
      
      console.info(
        '%c✅ Detection Model Ready',
        'color: #4CAF50; font-weight: bold;',
        '\nModel: COCO-SSD',
        '\nStatus: Cached globally for fast reuse'
      );
    } catch (error) {
      console.error('Model loading error:', error);
      throw error;
    } finally {
      isInitializing = false;
    }
  })();
  
  return initializationPromise;
}

function getModel() {
  if (typeof window !== 'undefined' && window.__HELMET_DETECTION_MODEL__) {
    return window.__HELMET_DETECTION_MODEL__;
  }
  return null;
}

export async function detectHelmet(
  video: HTMLVideoElement
): Promise<HelmetDetectionResult> {
  let model = getModel();
  
  if (!model) {
    await loadModel();
    model = getModel();
  }
  
  if (!model) {
    throw new Error('Failed to load detection model');
  }

  const predictions = await model.detect(video);
  
  const personDetection = predictions.find(p => p.class === 'person');
  const personDetected = !!personDetection;
  
  // Helmet detection using color analysis in the head region
  let helmetDetected = false;
  let confidence = 0;
  
  if (personDetected && personDetection) {
    // Analyze the head region for bright colors (yellow, orange, white) typical of safety helmets
    helmetDetected = analyzeHeadRegionForHelmet(video, personDetection.bbox);
    confidence = personDetection.score;
  }

  return {
    personDetected,
    helmetDetected,
    confidence: confidence * 100,
    detections: predictions.map(p => ({
      className: p.class,
      score: p.score,
      bbox: p.bbox as [number, number, number, number],
    })),
  };
}

function analyzeHeadRegionForHelmet(video: HTMLVideoElement, bbox: number[]): boolean {
  try {
    // Create a temporary canvas to analyze pixels
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Calculate head region (top 25% of person bbox)
    const [x, y, width, height] = bbox;
    const headHeight = height * 0.25;
    const headY = y;
    const headX = x + width * 0.25; // Center portion
    const headWidth = width * 0.5;

    // Sample pixels in the head region
    const imageData = ctx.getImageData(headX, headY, headWidth, headHeight);
    const pixels = imageData.data;

    let brightColorCount = 0;
    let totalPixels = 0;

    // Check for bright colors (yellow, orange, white, red - common helmet colors)
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      totalPixels++;

      // Check for bright safety colors
      const isYellow = r > 200 && g > 180 && b < 100;
      const isOrange = r > 200 && g > 100 && g < 180 && b < 100;
      const isWhite = r > 200 && g > 200 && b > 200;
      const isRed = r > 180 && g < 100 && b < 100;
      const isBrightBlue = r < 100 && g > 150 && b > 200;

      if (isYellow || isOrange || isWhite || isRed || isBrightBlue) {
        brightColorCount++;
      }
    }

    // If more than 15% of head region contains bright colors, assume helmet is present
    const brightColorRatio = brightColorCount / totalPixels;
    return brightColorRatio > 0.15;
  } catch (error) {
    console.error('Error analyzing head region:', error);
    return false; // Assume no helmet if analysis fails
  }
}

// For production use, implement a custom helmet detection model
export async function detectHelmetAdvanced(
  video: HTMLVideoElement
): Promise<HelmetDetectionResult> {
  // This would use a custom-trained model for helmet detection
  // For now, using the same logic as above
  return detectHelmet(video);
}
