import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface DrawingAnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

/**
 * DrawingAnimation Component
 * Creates an SVG path drawing effect using stroke-dasharray and stroke-dashoffset
 * Useful for decorative animated lines and shapes
 */
export const DrawingAnimation: React.FC<DrawingAnimationProps> = ({
  children,
  delay = 0,
  duration = 2,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const paths = svgRef.current.querySelectorAll('path, circle, rect, line, polygon');

      paths.forEach((path) => {
        if (path instanceof SVGGeometryElement) {
          const length = path.getTotalLength();
          // Set initial state
          path.setAttribute('stroke-dasharray', length.toString());
          path.setAttribute('stroke-dashoffset', length.toString());
        }
      });
    }
  }, []);

  return (
    <motion.svg
      ref={svgRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="w-full h-full"
    >
      {children}
    </motion.svg>
  );
};

/**
 * AnimatedPath Component
 * Individual SVG path that animates with drawing effect
 */
interface AnimatedPathProps {
  d: string;
  delay?: number;
  duration?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  [key: string]: any;
}

export const AnimatedPath: React.FC<AnimatedPathProps> = ({
  d,
  delay = 0,
  duration = 2,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
  ...props
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [d]);

  return (
    <motion.path
      ref={pathRef}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength || 1000}
      initial={{ strokeDashoffset: pathLength || 1000 }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration, ease: 'easeInOut' }}
      {...props}
    />
  );
};

/**
 * DrawingLine Component
 * Simple animated line drawing effect
 */
interface DrawingLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
}

export const DrawingLine: React.FC<DrawingLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  stroke = 'currentColor',
  strokeWidth = 2,
  delay = 0,
  duration = 1,
}) => {
  const lineRef = useRef<SVGLineElement>(null);

  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return (
    <motion.line
      ref={lineRef}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={lineLength || 100}
      initial={{ strokeDashoffset: lineLength || 100 }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration, ease: 'easeInOut' }}
    />
  );
};

/**
 * DrawingCircle Component
 * Animated circle drawing effect
 */
interface DrawingCircleProps {
  cx: number;
  cy: number;
  r: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  delay?: number;
  duration?: number;
}

export const DrawingCircle: React.FC<DrawingCircleProps> = ({
  cx,
  cy,
  r,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
  delay = 0,
  duration = 1.5,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const circleLength = 2 * Math.PI * r;

  return (
    <motion.circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={r}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeDasharray={circleLength}
      initial={{ strokeDashoffset: circleLength }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration, ease: 'easeInOut' }}
    />
  );
};

/**
 * DrawingRect Component
 * Animated rectangle drawing effect
 */
interface DrawingRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  delay?: number;
  duration?: number;
  rx?: number;
}

export const DrawingRect: React.FC<DrawingRectProps> = ({
  x,
  y,
  width,
  height,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
  delay = 0,
  duration = 1.5,
  rx = 0,
}) => {
  const rectRef = useRef<SVGRectElement>(null);
  const rectPerimeter = 2 * (width + height);

  return (
    <motion.rect
      ref={rectRef}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeDasharray={rectPerimeter}
      initial={{ strokeDashoffset: rectPerimeter }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration, ease: 'easeInOut' }}
    />
  );
};
