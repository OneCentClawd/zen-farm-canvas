import { WeatherData } from '../core/Environment';
import { PlotData } from '../core/GameData';
import { Game } from '../Game';
/**
 * UI 管理器 - 状态栏 + 操作按钮
 */
export declare class UIManager {
    private canvas;
    private game;
    private width;
    private height;
    private dpr;
    private statusBarExpanded;
    private statusBarHeight;
    private buttons;
    constructor(canvas: HTMLCanvasElement, game: Game);
    /**
     * 调整大小
     */
    resize(width: number, height: number): void;
    /**
     * 更新按钮布局
     */
    private updateButtonLayout;
    /**
     * 绑定事件
     */
    private bindEvents;
    /**
     * 处理点击（桌面端）
     */
    private handleClick;
    /**
     * 处理触摸（移动端）
     */
    private handleTouch;
    /**
     * 统一处理交互
     */
    private handleInteraction;
    /**
     * 检查按钮点击
     */
    private checkButtonClick;
    /**
     * 检查状态栏点击（展开/收起）
     */
    private checkStatusBarClick;
    /**
     * 渲染 UI
     */
    render(ctx: CanvasRenderingContext2D, weather: WeatherData, plot: PlotData | null): void;
    /**
     * 渲染状态栏
     */
    private renderStatusBar;
    /**
     * 渲染按钮
     */
    private renderButtons;
    /**
     * 渲染地块指示器
     */
    private renderPlotIndicator;
    /**
     * 获取天气图标
     */
    private getWeatherIcon;
}
