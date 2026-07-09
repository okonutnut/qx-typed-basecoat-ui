class BasePage extends qx.ui.container.Composite {
  protected __responsiveWidth = 0;

  constructor() {
    super();
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    const newWidth = qx.bom.Viewport.getWidth();
    if (newWidth !== this.__responsiveWidth) {
      this.__responsiveWidth = newWidth;
    }
  }

  protected __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }
}