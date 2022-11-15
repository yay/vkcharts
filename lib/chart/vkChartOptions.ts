type FontStyle = 'normal' | 'italic' | 'oblique';
type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type VkChartThemeName =
  | 'vk-default'
  | 'vk-default-dark'
  | 'vk-material'
  | 'vk-material-dark'
  | 'vk-pastel'
  | 'vk-pastel-dark'
  | 'vk-solar'
  | 'vk-solar-dark'
  | 'vk-vivid'
  | 'vk-vivid-dark';

export interface VkChartThemePalette {
  fills: string[];
  strokes: string[];
}

export interface VkChartThemeOptions {
  palette?: VkChartThemePalette;
  overrides?: VkChartThemeOverrides;
}

export interface VkChartTheme extends VkChartThemeOptions {
  baseTheme?: VkChartThemeName; // | ChartTheme;
}

export interface VkChartThemeOverrides {
  cartesian?: VkCartesianChartOptions<VkCartesianAxesTheme, VkCartesianSeriesTheme>;
  column?: VkCartesianChartOptions<VkCartesianAxesTheme, VkBarSeriesOptions>;
  bar?: VkCartesianChartOptions<VkCartesianAxesTheme, VkBarSeriesOptions>;
  line?: VkCartesianChartOptions<VkCartesianAxesTheme, VkLineSeriesOptions>;
  area?: VkCartesianChartOptions<VkCartesianAxesTheme, VkAreaSeriesOptions>;
  scatter?: VkCartesianChartOptions<VkCartesianAxesTheme, VkScatterSeriesOptions>;

  polar?: VkPolarChartOptions<VkPolarAxesTheme, VkPolarSeriesTheme>;
  pie?: VkPolarChartOptions<VkPolarAxesTheme, VkPieSeriesOptions>;

  hierarchy?: VkHierarchyChartOptions<VkHierarchySeriesTheme>;
  treemap?: VkHierarchyChartOptions<VkHierarchySeriesOptions>;

  common?: any;
}

interface VkCartesianAxisThemeOptions<T> {
  top?: Omit<Omit<T, 'top'>, 'type'>;
  right?: Omit<Omit<T, 'right'>, 'type'>;
  bottom?: Omit<Omit<T, 'bottom'>, 'type'>;
  left?: Omit<Omit<T, 'left'>, 'type'>;
}

export interface VkNumberAxisThemeOptions
  extends Omit<VkNumberAxisOptions, 'type'>,
    VkCartesianAxisThemeOptions<VkNumberAxisOptions> {}
export interface VkLogAxisThemeOptions
  extends Omit<VkLogAxisOptions, 'type'>,
    VkCartesianAxisThemeOptions<VkLogAxisOptions> {}
export interface VkCategoryAxisThemeOptions
  extends Omit<VkCategoryAxisOptions, 'type'>,
    VkCartesianAxisThemeOptions<VkCategoryAxisOptions> {}
export interface VkGroupedCategoryAxisThemeOptions
  extends Omit<VkGroupedCategoryAxisOptions, 'type'>,
    VkCartesianAxisThemeOptions<VkGroupedCategoryAxisOptions> {}
export interface VkTimeAxisThemeOptions
  extends Omit<VkTimeAxisOptions, 'type'>,
    VkCartesianAxisThemeOptions<VkTimeAxisOptions> {}

export interface VkCartesianAxesTheme {
  number?: VkNumberAxisThemeOptions;
  log?: VkLogAxisThemeOptions;
  category?: VkCategoryAxisThemeOptions;
  groupedCategory?: VkGroupedCategoryAxisThemeOptions;
  time?: VkTimeAxisThemeOptions;
}

export interface VkCartesianSeriesTheme {
  line?: VkLineSeriesOptions;
  scatter?: VkScatterSeriesOptions;
  area?: VkAreaSeriesOptions;
  bar?: VkBarSeriesOptions;
  column?: VkBarSeriesOptions;
}

export interface VkPolarAxesTheme {
  // polar charts don't support axes at the moment
  // (used by radar charts, for example)
}

export interface VkPolarSeriesTheme {
  pie?: VkPieSeriesOptions;
}

export interface VkHierarchySeriesTheme {
  treemap?: VkTreemapSeriesOptions;
}

export interface VkChartPaddingOptions {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

interface VkChartLabelOptions {
  enabled?: boolean;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface VkDropShadowOptions {
  enabled?: boolean;
  color?: string;
  xOffset?: number;
  yOffset?: number;
  blue?: number;
}

export interface VkChartCaptionOptions {
  enabled?: boolean;
  padding?: VkChartPaddingOptions;
  text?: string;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface VkNavigatorMaskOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

interface VkNavigatorHandleOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
  gripLineGap?: number;
  gripLineLength?: number;
}

export interface VkNavigatorOptions {
  enabled?: boolean;
  height?: number;
  margin?: number;
  min?: number;
  max?: number;
  mask?: VkNavigatorMaskOptions;
  minHandle?: VkNavigatorHandleOptions;
  maxHandle?: VkNavigatorHandleOptions;
}

type VkChartLegendPosition = 'top' | 'right' | 'bottom' | 'left';

interface VkChartLegendMarkerOptions {
  size?: number;
  shape?: string | (new () => any); // Remove the (new () => any) eventually.
  padding?: number;
  strokeWidth?: number;
}

interface VkChartLegendLabelOptions {
  color?: string;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
  fontSize?: number;
  fontFamily?: string;
}

interface VkChartLegendItemOptions {
  marker?: VkChartLegendMarkerOptions;
  label?: VkChartLegendLabelOptions;
  paddingX?: number;
  paddingY?: number;
}

export interface VkChartLegendOptions {
  enabled?: boolean;
  position?: VkChartLegendPosition;
  spacing?: number;
  item?: VkChartLegendItemOptions;
}

interface VkChartTooltipOptions {
  enabled?: boolean;
  class?: string;
  tracking?: boolean;
  delay?: number;
}

interface VkBaseChartOptions {
  container?: HTMLElement | null;
  data?: any[];
  width?: number;
  height?: number;
  autoSize?: boolean;
  padding?: VkChartPaddingOptions;
  background?: {
    visible?: boolean;
    fill?: string;
  };
  title?: VkChartCaptionOptions;
  subtitle?: VkChartCaptionOptions;
  tooltip?: VkChartTooltipOptions;
  navigator?: VkNavigatorOptions;
  legend?: VkChartLegendOptions;
  listeners?: { [key: string]: Function };
  theme?: string | VkChartTheme; // | ChartTheme
}

interface VkBaseAxisOptions {
  keys?: string[];
}

type VkCartesianAxisPosition = 'top' | 'right' | 'bottom' | 'left';

interface VkAxisLineOptions {
  width?: number;
  color?: string;
}

interface VkAxisTickOptions {
  width?: number;
  size?: number;
  color?: string;
  count?: any;
}

interface VkAxisLabelFormatterParams {
  readonly value: any;
  readonly index: number;
  readonly fractionDigits?: number;
  readonly formatter?: (x: any) => string;
}

interface VkAxisLabelOptions {
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
  fontSize?: number;
  fontFamily?: string;
  padding?: number;
  color?: string;
  rotation?: number;
  // mirrored?: boolean;
  // parallel?: boolean;
  format?: string;
  formatter?: (params: VkAxisLabelFormatterParams) => string;
}

interface VkAxisGridStyle {
  stroke?: string;
  lineDash?: number[];
}

export type VkCartesianAxisType = 'category' | 'groupedCategory' | 'number' | 'log' | 'time';

interface VkBaseCartesianAxisOptions extends VkBaseAxisOptions {
  position?: VkCartesianAxisPosition;
  title?: VkChartCaptionOptions;
  line?: VkAxisLineOptions;
  tick?: VkAxisTickOptions;
  label?: VkAxisLabelOptions;
  gridStyle?: VkAxisGridStyle[];
}

interface VkNumberAxisOptions extends VkBaseCartesianAxisOptions {
  type: 'number';
  nice?: boolean;
  min?: number;
  max?: number;
}

interface VkLogAxisOptions extends VkBaseCartesianAxisOptions {
  type: 'log';
  nice?: boolean;
  min?: number;
  max?: number;
  base?: number;
}

interface VkCategoryAxisOptions extends VkBaseCartesianAxisOptions {
  type: 'category';
  paddingInner?: number;
  paddingOuter?: number;
}

interface VkGroupedCategoryAxisOptions extends VkBaseCartesianAxisOptions {
  type: 'groupedCategory';
}

interface VkTimeAxisOptions extends VkBaseCartesianAxisOptions {
  type: 'time';
  nice?: boolean;
}

export type VkCartesianAxisOptions =
  | VkNumberAxisOptions
  | VkLogAxisOptions
  | VkCategoryAxisOptions
  | VkGroupedCategoryAxisOptions
  | VkTimeAxisOptions;

type VkPolarAxisOptions = any;

interface VkBaseSeriesOptions {
  data?: any[];
  visible?: boolean;
  showInLegend?: boolean;
  cursor?: string;
  listeners?: { [key: string]: Function };
  highlightStyle?: {
    item?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    };
    series?: {
      enabled?: boolean;
      dimOpacity?: number;
      strokeWidth?: number;
    };
  };
}

export interface VkTooltipRendererResult {
  title?: string;
  content?: string;
}

interface VkSeriesTooltipRendererParams {
  readonly datum: any;
  readonly title?: string;
  readonly color?: string;
}

interface VkCartesianSeriesTooltipRendererParams extends VkSeriesTooltipRendererParams {
  readonly xKey: string;
  readonly xValue?: any;
  readonly xName?: string;

  readonly yKey: string;
  readonly yValue?: any;
  readonly yName?: string;
}

export interface VkPolarSeriesTooltipRendererParams extends VkSeriesTooltipRendererParams {
  readonly angleKey: string;
  readonly angleValue?: any;
  readonly angleName?: string;

  readonly radiusKey?: string;
  readonly radiusValue?: any;
  readonly radiusName?: string;
}

interface VkScatterSeriesTooltipRendererParams extends VkCartesianSeriesTooltipRendererParams {
  readonly sizeKey?: string;
  readonly sizeName?: string;

  readonly labelKey?: string;
  readonly labelName?: string;
}

interface VkSeriesMarker {
  enabled?: boolean;
  shape?: string;
  size?: number;
  maxSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
}

export interface VkCartesianSeriesMarkerFormatterParams {
  xKey: string;
  yKey: string;
}

export interface VkCartesianSeriesMarkerFormat {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  size?: number;
}

export type VkCartesianSeriesMarkerFormatter = (
  params: VkCartesianSeriesMarkerFormatterParams
) => VkCartesianSeriesMarkerFormat;

interface VkCartesianSeriesMarker extends VkSeriesMarker {
  formatter?: VkCartesianSeriesMarkerFormatter;
}

export interface VkSeriesTooltip {
  enabled?: boolean;
}

interface VkLineSeriesLabelOptions extends VkChartLabelOptions {
  formatter?: (params: { value: any }) => string;
}

export interface VkLineSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkCartesianSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

export interface VkLineSeriesOptions extends VkBaseSeriesOptions {
  type?: 'line';
  marker?: VkCartesianSeriesMarker;
  xKey?: string;
  yKey?: string;
  xName?: string;
  yName?: string;
  title?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  label?: VkLineSeriesLabelOptions;
  tooltip?: VkLineSeriesTooltip;
}

export interface VkScatterSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkScatterSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

interface VkScatterSeriesLabelOptions extends VkChartLabelOptions {}

export interface VkScatterSeriesOptions extends VkBaseSeriesOptions {
  type?: 'scatter';
  marker?: VkCartesianSeriesMarker;
  label?: VkScatterSeriesLabelOptions;
  xKey?: string;
  yKey?: string;
  xName?: string;
  yName?: string;
  title?: string;
  tooltip?: VkScatterSeriesTooltip;
}

export interface VkAreaSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkCartesianSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
  format?: string;
}

interface VkAreaSeriesLabelOptions extends VkChartLabelOptions {
  formatter?: (params: { value: any }) => string;
}

export interface VkAreaSeriesOptions extends VkBaseSeriesOptions {
  type?: 'area';
  marker?: VkCartesianSeriesMarker;
  xKey?: string;
  yKeys?: string[];
  xName?: string;
  yNames?: string[];
  fills?: string[];
  strokes?: string[];
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  shadow?: VkDropShadowOptions;
  label?: VkAreaSeriesLabelOptions;
  tooltip?: VkAreaSeriesTooltip;
}

interface VkBarSeriesLabelOptions extends VkChartLabelOptions {
  formatter?: (params: { value: number }) => string;
  placement?: 'inside' | 'outside';
}

export interface VkBarSeriesFormatterParams {
  readonly datum: any;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly highlighted: boolean;
  readonly xKey: string;
  readonly yKey: string;
}

export interface VkBarSeriesFormat {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface VkBarSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkCartesianSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

export interface VkBarSeriesOptions extends VkBaseSeriesOptions {
  type?: 'bar' | 'column';
  grouped?: boolean;
  normalizedTo?: number;
  xKey?: string;
  yKeys?: string[] | string[][];
  xName?: string;
  yNames?: string[] | { [key: string]: string };
  fills?: string[];
  strokes?: string[];
  strokeWidth?: number;
  fillOpacity?: number;
  strokeOpacity?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  shadow?: VkDropShadowOptions;
  label?: VkBarSeriesLabelOptions;
  tooltip?: VkBarSeriesTooltip;
  formatter?: (params: VkBarSeriesFormatterParams) => VkBarSeriesFormat;
}

export interface VkHistogramSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkCartesianSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

interface VkPieSeriesLabelOptions extends VkChartLabelOptions {
  offset?: number;
  minAngle?: number;
}

export interface VkPieSeriesFormatterParams {
  readonly datum: any;
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth: number;
  readonly highlighted: boolean;
  readonly angleKey: string;
  readonly radiusKey?: string;
}

export interface VkPieSeriesFormat {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface VkPieSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkPieSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

export interface VkPieTitleOptions extends VkChartCaptionOptions {
  showInLegend?: boolean;
}

export interface VkPieSeriesOptions extends VkBaseSeriesOptions {
  type?: 'pie';
  title?: VkPieTitleOptions;
  label?: VkPieSeriesLabelOptions;
  callout?: {
    colors?: string[];
    length?: number;
    strokeWidth?: number;
  };
  angleKey?: string;
  angleName?: string;
  radiusKey?: string;
  radiusName?: string;
  labelKey?: string;
  labelName?: string;
  fills?: string[];
  strokes?: string[];
  fillOpacity?: number;
  strokeOpacity?: number;
  strokeWidth?: number;
  lineDash?: number[];
  lineDashOffset?: number;
  rotation?: number;
  outerRadiusOffset?: number;
  innerRadiusOffset?: number;
  shadow?: VkDropShadowOptions;
  tooltip?: VkPieSeriesTooltip;
  formatter?: (params: VkPieSeriesFormatterParams) => VkPieSeriesFormat;
}

interface VkPieSeriesTooltipRendererParams extends VkPolarSeriesTooltipRendererParams {
  labelKey?: string;
  labelName?: string;
}

interface VkTreemapSeriesLabelOptions extends VkChartLabelOptions {
  padding?: number;
}

interface VkTreemapNodeDatum {
  datum: any;
  parent?: VkTreemapNodeDatum;
  children?: VkTreemapNodeDatum[];
  depth: number;
}

interface VkTreemapSeriesTooltipRendererParams {
  datum: VkTreemapNodeDatum;
  sizeKey: string;
  labelKey: string;
  valueKey: string;
  color: string;
}

export interface VkTreemapSeriesTooltip extends VkSeriesTooltip {
  renderer?: (params: VkTreemapSeriesTooltipRendererParams) => string | VkTooltipRendererResult;
}

export interface VkTreemapSeriesOptions extends VkBaseSeriesOptions {
  type?: 'treemap';
  title?: VkTreemapSeriesLabelOptions;
  subtitle?: VkTreemapSeriesLabelOptions;
  labels?: {
    large?: VkChartLabelOptions;
    medium?: VkChartLabelOptions;
    small?: VkChartLabelOptions;
    value?: VkChartLabelOptions;
  };
  labelKey?: string;
  sizeKey?: string;
  colorKey?: string;
  colorDomain?: number[];
  colorRange?: string[];
  colorParents?: boolean;
  tooltip?: VkTreemapSeriesTooltip;
  nodePadding?: number;
  gradient?: boolean;
}

type VkCartesianSeriesOptions = VkLineSeriesOptions | VkScatterSeriesOptions | VkAreaSeriesOptions | VkBarSeriesOptions;

type VkPolarSeriesOptions = VkPieSeriesOptions;

type VkHierarchySeriesOptions = VkTreemapSeriesOptions;

export interface VkCartesianChartOptions<
  TAxisOptions = VkCartesianAxisOptions[],
  TSeriesOptions = VkCartesianSeriesOptions[]
> extends VkBaseChartOptions {
  type?: 'cartesian' | 'groupedCategory' | 'line' | 'bar' | 'column' | 'area' | 'scatter';
  axes?: TAxisOptions;
  series?: TSeriesOptions;
}

export interface VkPolarChartOptions<TAxisOptions = VkPolarAxisOptions[], TSeriesOptions = VkPolarSeriesOptions[]>
  extends VkBaseChartOptions {
  type?: 'polar' | 'pie';
  axes?: TAxisOptions; // will be supported in the future and used by radar series
  series?: TSeriesOptions;
}

export interface VkHierarchyChartOptions<TSeriesOptions = VkHierarchySeriesOptions[]> extends VkBaseChartOptions {
  type?: 'hierarchy' | 'treemap';
  data?: any;
  series?: TSeriesOptions;
}

export type VkChartOptions = VkCartesianChartOptions | VkPolarChartOptions | VkHierarchyChartOptions;
