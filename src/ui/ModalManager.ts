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

export class ModalManager {
  private width: number = 0;
  private height: number = 0;
  private dpr: number = 1;
  
  private currentModal: ModalConfig | null = null;
  private buttonRects: { btn: ModalButton; x: number; y: number; w: number; h: number }[] = [];
  
  // 回调
  private onClose: (() => void) | null = null;
  
  constructor() {
    this.dpr = window.devicePixelRatio || 1;
  }
  
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  
  /**
   * 显示弹窗
   */
  show(config: ModalConfig, onClose?: () => void) {
    this.currentModal = config;
    this.onClose = onClose || null;
    this.updateButtonRects();
  }
  
  /**
   * 关闭弹窗
   */
  close() {
    this.currentModal = null;
    this.buttonRects = [];
    if (this.onClose) {
      this.onClose();
      this.onClose = null;
    }
  }
  
  /**
   * 是否有弹窗显示
   */
  isVisible(): boolean {
    return this.currentModal !== null;
  }
  
  /**
   * 处理点击
   */
  handleClick(x: number, y: number): boolean {
    if (!this.currentModal) return false;
    
    // 检查按钮点击
    for (const rect of this.buttonRects) {
      if (x >= rect.x && x <= rect.x + rect.w &&
          y >= rect.y && y <= rect.y + rect.h) {
        rect.btn.action();
        this.close();
        return true;
      }
    }
    
    // 点击弹窗外关闭
    const modalWidth = Math.min(this.width * 0.85, 350 * this.dpr);
    const modalHeight = this.getModalHeight();
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;
    
    if (x < modalX || x > modalX + modalWidth ||
        y < modalY || y > modalY + modalHeight) {
      this.close();
      return true;
    }
    
    return true;  // 弹窗内点击也消费事件
  }
  
  /**
   * 渲染弹窗
   */
  render(ctx: CanvasRenderingContext2D) {
    if (!this.currentModal) return;
    
    // 遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    const modalWidth = Math.min(this.width * 0.85, 350 * this.dpr);
    const modalHeight = this.getModalHeight();
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;
    const padding = 20 * this.dpr;
    const radius = 15 * this.dpr;
    
    // 弹窗背景
    ctx.fillStyle = 'rgba(40, 40, 50, 0.95)';
    ctx.beginPath();
    ctx.roundRect(modalX, modalY, modalWidth, modalHeight, radius);
    ctx.fill();
    
    // 标题
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${18 * this.dpr}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(this.currentModal.title, this.width / 2, modalY + padding + 15 * this.dpr);
    
    // 消息
    if (this.currentModal.message) {
      ctx.font = `${14 * this.dpr}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(this.currentModal.message, this.width / 2, modalY + padding + 45 * this.dpr);
    }
    
    // 按钮
    this.renderButtons(ctx, modalX, modalY, modalWidth, modalHeight, padding);
    
    ctx.textAlign = 'left';
  }
  
  /**
   * 渲染按钮
   */
  private renderButtons(ctx: CanvasRenderingContext2D, modalX: number, modalY: number, modalWidth: number, modalHeight: number, padding: number) {
    const buttons = this.currentModal!.buttons;
    const btnHeight = 50 * this.dpr;
    const btnGap = 10 * this.dpr;
    const btnWidth = modalWidth - padding * 2;
    
    // 种植选择：2x2 网格
    if (this.currentModal!.type === 'plant' && buttons.length === 4) {
      const gridBtnW = (modalWidth - padding * 3) / 2;
      const gridBtnH = 70 * this.dpr;
      const startY = modalY + 60 * this.dpr;
      
      for (let i = 0; i < buttons.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = modalX + padding + col * (gridBtnW + padding);
        const y = startY + row * (gridBtnH + btnGap);
        
        this.drawButton(ctx, buttons[i], x, y, gridBtnW, gridBtnH, true);
      }
    } else {
      // 普通按钮列表
      const startY = modalY + modalHeight - padding - buttons.length * (btnHeight + btnGap) + btnGap;
      
      for (let i = 0; i < buttons.length; i++) {
        const x = modalX + padding;
        const y = startY + i * (btnHeight + btnGap);
        
        this.drawButton(ctx, buttons[i], x, y, btnWidth, btnHeight, false);
      }
    }
  }
  
  /**
   * 绘制单个按钮
   */
  private drawButton(ctx: CanvasRenderingContext2D, btn: ModalButton, x: number, y: number, w: number, h: number, showIcon: boolean) {
    // 背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10 * this.dpr);
    ctx.fill();
    
    // 图标+文字
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (showIcon && btn.icon) {
      ctx.font = `${28 * this.dpr}px sans-serif`;
      ctx.fillText(btn.icon, x + w / 2, y + h / 2 - 10 * this.dpr);
      ctx.font = `${12 * this.dpr}px sans-serif`;
      ctx.fillText(btn.label, x + w / 2, y + h - 15 * this.dpr);
    } else {
      ctx.font = `${14 * this.dpr}px sans-serif`;
      ctx.fillText(btn.label, x + w / 2, y + h / 2);
    }
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  
  /**
   * 更新按钮位置
   */
  private updateButtonRects() {
    if (!this.currentModal) return;
    
    this.buttonRects = [];
    const buttons = this.currentModal.buttons;
    const modalWidth = Math.min(this.width * 0.85, 350 * this.dpr);
    const modalHeight = this.getModalHeight();
    const modalX = (this.width - modalWidth) / 2;
    const modalY = (this.height - modalHeight) / 2;
    const padding = 20 * this.dpr;
    const btnHeight = 50 * this.dpr;
    const btnGap = 10 * this.dpr;
    
    if (this.currentModal.type === 'plant' && buttons.length === 4) {
      const gridBtnW = (modalWidth - padding * 3) / 2;
      const gridBtnH = 70 * this.dpr;
      const startY = modalY + 60 * this.dpr;
      
      for (let i = 0; i < buttons.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        this.buttonRects.push({
          btn: buttons[i],
          x: modalX + padding + col * (gridBtnW + padding),
          y: startY + row * (gridBtnH + btnGap),
          w: gridBtnW,
          h: gridBtnH
        });
      }
    } else {
      const btnWidth = modalWidth - padding * 2;
      const startY = modalY + modalHeight - padding - buttons.length * (btnHeight + btnGap) + btnGap;
      
      for (let i = 0; i < buttons.length; i++) {
        this.buttonRects.push({
          btn: buttons[i],
          x: modalX + padding,
          y: startY + i * (btnHeight + btnGap),
          w: btnWidth,
          h: btnHeight
        });
      }
    }
  }
  
  /**
   * 计算弹窗高度
   */
  private getModalHeight(): number {
    if (!this.currentModal) return 0;
    
    const padding = 20 * this.dpr;
    const titleHeight = 40 * this.dpr;
    const messageHeight = this.currentModal.message ? 30 * this.dpr : 0;
    
    if (this.currentModal.type === 'plant') {
      // 2x2 网格
      return titleHeight + messageHeight + 170 * this.dpr + padding * 2;
    }
    
    const btnHeight = 50 * this.dpr;
    const btnGap = 10 * this.dpr;
    const buttonsHeight = this.currentModal.buttons.length * (btnHeight + btnGap);
    
    return titleHeight + messageHeight + buttonsHeight + padding * 2;
  }
}

// ========== 预设弹窗配置 ==========

/**
 * 种植选择弹窗（第一步：选植物）
 */
export function createPlantModal(onSelect: (type: string) => void): ModalConfig {
  return {
    type: 'plant',
    title: '选择种子',
    buttons: [
      { icon: '🍀', label: '三叶草', action: () => onSelect('clover') },
      { icon: '🌻', label: '向日葵', action: () => onSelect('sunflower') },
      { icon: '🍓', label: '草莓', action: () => onSelect('strawberry') },
      { icon: '🌸', label: '樱花', action: () => onSelect('sakura') }
    ]
  };
}

/**
 * 难度选择弹窗（第二步：选难度）
 */
export function createDifficultyModal(plantType: string, onSelect: (hardMode: boolean) => void): ModalConfig {
  return {
    type: 'confirm',
    title: '选择难度',
    message: `种植${getPlantName(plantType)}`,
    buttons: [
      { label: '🧘 佛系模式', action: () => onSelect(false) },
      { label: '💪 硬核模式', action: () => onSelect(true) }
    ]
  };
}

/**
 * 获取植物中文名
 */
function getPlantName(type: string): string {
  const names: { [key: string]: string } = {
    clover: '三叶草',
    sunflower: '向日葵',
    strawberry: '草莓',
    sakura: '樱花'
  };
  return names[type] || type;
}

/**
 * 设施菜单弹窗
 */
export function createFacilityModal(
  hasShelter: boolean,
  hasDehumidifier: boolean,
  onShelter: () => void,
  onDehumidifier: () => void
): ModalConfig {
  return {
    type: 'facility',
    title: '设施管理',
    buttons: [
      { 
        icon: '⛱️', 
        label: hasShelter ? '移除遮雨棚' : '安装遮雨棚', 
        action: onShelter 
      },
      { 
        icon: '💨', 
        label: hasDehumidifier ? '移除除湿器' : '安装除湿器', 
        action: onDehumidifier 
      }
    ]
  };
}

/**
 * 确认弹窗
 */
export function createConfirmModal(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): ModalConfig {
  return {
    type: 'confirm',
    title,
    message,
    buttons: [
      { label: '确认', action: onConfirm },
      { label: '取消', action: onCancel || (() => {}) }
    ]
  };
}
