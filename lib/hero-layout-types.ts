/**
 * Type definitions for the Hero layout editor.
 * Used by HeroSectionPreview and the admin hero editor.
 */

export interface LayerProps {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

export interface TextLayerProps extends LayerProps {
  maxWidth: number;
  textAlign: "left" | "center" | "right";
  showSubtitle: boolean;
}

export interface ParallaxConfig {
  yFactor: number;
}

export interface BadgeConfig {
  src: string;
  alt: string;
}

export interface BadgeArrangement {
  radius: number;
  startAngleDeg: number;
  centerBadgeIndex: number;
}

export interface BaseLayer {
  id: string;
  type: string;
  parallax: ParallaxConfig;
  desktop: LayerProps;
  mobile: LayerProps;
}

export interface ImageLayer extends BaseLayer {
  type: "image" | "background";
  assetPath: string;
}

export interface BadgeGroupConfig extends BaseLayer {
  type: "badge-group";
  badges: BadgeConfig[];
  arrangement: BadgeArrangement;
}

export interface TextOverlayLayer extends BaseLayer {
  type: "text-overlay";
  desktop: TextLayerProps;
  mobile: TextLayerProps;
}

export type AnyLayer = ImageLayer | BadgeGroupConfig | TextOverlayLayer;

export interface HeroLayoutConfig {
  id: string;
  name: string;
  layers: AnyLayer[];
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export function isImageLayer(layer: AnyLayer): layer is ImageLayer {
  return layer.type === "image" || layer.type === "background";
}

export function isBadgeGroup(layer: AnyLayer): layer is BadgeGroupConfig {
  return layer.type === "badge-group";
}

export function isTextOverlay(layer: AnyLayer): layer is TextOverlayLayer {
  return layer.type === "text-overlay";
}
