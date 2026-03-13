/**
 * 弹窗系统 - 种植选择、设施菜单、确认弹窗
 */
export type ModalType = 'plant' | 'facility' | 'confirm' | 'none';
export interface ModalButton {
    label: string;
    icon?: string;
    action: () => void;
}
export interface ModalConfig {
    type: ModalType;
    title: string;
    message?: string;
    buttons: ModalButton[];
}
export declare class ModalManager {
    private width;
    private height;
    private dpr;
    private currentModal;
    private buttonRects;
    private onClose;
    constructor();
    resize(width: number, height: number): void;
    /**
     * 显示弹窗
     */
    show(config: ModalConfig, onClose?: () => void): void;
    /**
     * 关闭弹窗
     */
    close(): void;
    /**
     * 是否有弹窗显示
     */
    isVisible(): boolean;
    /**
     * 处理点击
     */
    handleClick(x: number, y: number): boolean;
    /**
     * 渲染弹窗
     */
    render(ctx: CanvasRenderingContext2D): void;
    /**
     * 渲染按钮
     */
    private renderButtons;
    /**
     * 绘制单个按钮
     */
    private drawButton;
    /**
     * 更新按钮位置
     */
    private updateButtonRects;
    /**
     * 计算弹窗高度
     */
    private getModalHeight;
}
/**
 * 种植选择弹窗（第一步：选植物）
 */
export declare function createPlantModal(onSelect: (type: string) => void): ModalConfig;
/**
 * 难度选择弹窗（第二步：选难度）
 */
export declare function createDifficultyModal(plantType: string, onSelect: (hardMode: boolean) => void): ModalConfig;
/**
 * 设施菜单弹窗
 */
export declare function createFacilityModal(hasShelter: boolean, hasDehumidifier: boolean, onShelter: () => void, onDehumidifier: () => void): ModalConfig;
/**
 * 确认弹窗
 */
export declare function createConfirmModal(title: string, message: string, onConfirm: () => void, onCancel?: () => void): ModalConfig;
