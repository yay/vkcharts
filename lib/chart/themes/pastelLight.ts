import { type VkChartThemePalette } from '../vkChartOptions';
import { ChartTheme } from './chartTheme';

const palette: VkChartThemePalette = {
  fills: ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'],
  strokes: ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'],
};

export class PastelLight extends ChartTheme {
  protected getPalette(): VkChartThemePalette {
    return palette;
  }
}
