import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface AuctionHistoryChartPoint {
  label: string;
  high: number;
  low: number;
  median: number;
  opening: number;
}

type AuctionSeriesKey = 'high' | 'low' | 'median' | 'opening';

@Component({
  selector: 'app-auction-history-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-history-chart.component.html',
  styleUrls: ['./auction-history-chart.component.scss']
})
export class AuctionHistoryChartComponent {
  @Input() points: AuctionHistoryChartPoint[] = [];
  @Input() unitLabel = 'tr';
  @Input() valueSuffix = '/m²';

  readonly chartWidth = 960;
  readonly chartHeight = 320;
  readonly paddingLeft = 56;
  readonly paddingRight = 20;
  readonly paddingTop = 16;
  readonly paddingBottom = 36;
  hoveredNode: { index: number; series: AuctionSeriesKey } | null = null;
  readonly seriesKeys: AuctionSeriesKey[] = ['high', 'low', 'median', 'opening'];
  readonly seriesLabelMap: Record<AuctionSeriesKey, string> = {
    high: 'Giá cao',
    low: 'Giá thấp',
    median: 'Giá phổ biến',
    opening: 'Giá khởi điểm'
  };

  get drawableWidth(): number {
    return this.chartWidth - this.paddingLeft - this.paddingRight;
  }

  get drawableHeight(): number {
    return this.chartHeight - this.paddingTop - this.paddingBottom;
  }

  get xStep(): number {
    if (this.points.length <= 1) return this.drawableWidth;
    return this.drawableWidth / (this.points.length - 1);
  }

  get maxValue(): number {
    const series = this.points.flatMap((p) => [p.high, p.low, p.median, p.opening]);
    const max = Math.max(...series, 1);
    return Math.ceil(max / 5) * 5;
  }

  get yTicks(): number[] {
    const tickCount = 4;
    const step = this.maxValue / tickCount;
    return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(i * step));
  }

  get highPath(): string {
    return this.buildPath('high');
  }

  get lowPath(): string {
    return this.buildPath('low');
  }

  get medianPath(): string {
    return this.buildPath('median');
  }

  get openingPath(): string {
    return this.buildPath('opening');
  }

  get lastPointX(): number {
    return this.getX(this.points.length - 1);
  }

  get openingBaseY(): number {
    return this.paddingTop + this.drawableHeight;
  }

  formatTick(value: number): string {
    return value === 0 ? '0' : `${value} ${this.unitLabel}`;
  }

  setHoveredNode(node: { index: number; series: AuctionSeriesKey } | null): void {
    this.hoveredNode = node;
  }

  get tooltipPoint(): AuctionHistoryChartPoint | null {
    if (!this.hoveredNode) return null;
    return this.points[this.hoveredNode.index] ?? null;
  }

  get tooltipSeriesLabel(): string {
    if (!this.hoveredNode) return '';
    return this.seriesLabelMap[this.hoveredNode.series];
  }

  get tooltipSeriesValue(): number {
    if (!this.tooltipPoint || !this.hoveredNode) return 0;
    return this.tooltipPoint[this.hoveredNode.series];
  }

  get tooltipLeftPercent(): number {
    if (!this.hoveredNode || this.points.length <= 1) return 0;
    return (this.hoveredNode.index / (this.points.length - 1)) * 100;
  }

  get tooltipTopPercent(): number {
    if (!this.tooltipPoint || !this.hoveredNode) return 0;
    const y = this.getY(this.tooltipPoint[this.hoveredNode.series]);
    return (y / this.chartHeight) * 100;
  }

  isActiveNode(index: number, series: AuctionSeriesKey): boolean {
    return this.hoveredNode?.index === index && this.hoveredNode?.series === series;
  }

  formatValue(value: number): string {
    const normalized = Number.isFinite(value) ? value : 0;
    return `${normalized.toFixed(1).replace('.', ',')}${this.unitLabel}${this.valueSuffix}`;
  }

  getX(index: number): number {
    return this.paddingLeft + index * this.xStep;
  }

  getY(value: number): number {
    const ratio = value / this.maxValue;
    return this.paddingTop + this.drawableHeight * (1 - ratio);
  }

  getSeriesValue(point: AuctionHistoryChartPoint, series: AuctionSeriesKey): number {
    return point[series];
  }

  private buildPath(key: 'high' | 'low' | 'median' | 'opening'): string {
    if (!this.points.length) return '';
    return this.points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${this.getX(index)} ${this.getY(point[key])}`)
      .join(' ');
  }
}
