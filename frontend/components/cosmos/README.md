# DeFi Cosmos 3D Visualization

## Overview
Interactive 3D solar system visualization where DeFi protocols orbit as planets around Ethereum (the sun).

## Components

- **CosmosVisualization.tsx** - Main canvas with Three.js setup
- **ProtocolPlanet.tsx** - Individual protocol planets with orbital motion
- **Sun.tsx** - Central Ethereum sun
- **LoadingCosmos.tsx** - Loading state component

## Visual Metaphors

| Element | Represents | Formula |
|---------|-----------|---------|
| Planet Size | TVL | `0.4 + log10(TVL) / 10` |
| Planet Color | Health Score | Green (80+), Yellow (50-79), Red (<50) |
| Orbital Speed | TPS | `0.05 + (TPS/100) * 0.3` |
| Emissive Glow | Activity | High: 0.8, Low: 0.4 |
| Erratic Motion | Poor Health | Vertical bobbing when score < 50 |

## Orbital Configuration

- **Uniswap**: radius 4, angle 0°
- **Aave**: radius 6, angle 90°
- **Lido**: radius 8, angle 180°
- **Curve**: radius 10, angle 270°

## Features

- ✅ Real-time data updates
- ✅ Interactive camera controls (zoom, rotate)
- ✅ Hover tooltips with protocol details
- ✅ Health-based visual indicators
- ✅ Activity-based animations
- ✅ Starfield background
- ✅ Performance optimized

## Usage

```tsx
import { CosmosVisualization } from '@/components/cosmos';

<CosmosVisualization protocols={protocolsData} />
```

## Dependencies

- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers (Stars, Html, OrbitControls)
- `three` - 3D graphics library
