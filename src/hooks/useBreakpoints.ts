import { useWindowDimensions } from 'react-native';

/**
 * Responsive breakpoints for CurveDay.
 * mobile  < 768px   — phone portrait / landscape
 * tablet  768–1099  — iPad, small browser window
 * desktop ≥ 1100px  — full browser / Electron
 */
export function useBreakpoints() {
  const { width, height } = useWindowDimensions();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;
  return { isMobile, isTablet, isDesktop, width, height };
}
