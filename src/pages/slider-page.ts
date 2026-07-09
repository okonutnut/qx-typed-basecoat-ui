class SliderPage extends BasePage {
  constructor() {
    super();
    this.setLayout(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.add(this.createDefaultSection());
    this.add(this.createMinMaxSection());
    this.add(this.createStepSection());
    this.add(this.createDisabledSection());
  }

  private createDefaultSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Default");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const slider = new BsSlider(0, 100, 50).set({ width: 250 });
    container.add(slider, { paddingTop: 20 });

    const valueLabel = new qx.ui.basic.Label("Value: 50");
    valueLabel.setTextColor("var(--muted-foreground)");
    container.add(valueLabel);

    slider.onChangeValue((value: number) => {
      valueLabel.setValue(`Value: ${value}`);
    });

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }

  private createMinMaxSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Min and Max");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const row1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label1 = new qx.ui.basic.Label("0 to 100 (default)");
    label1.setTextColor("var(--muted-foreground)");
    row1.add(label1);
    const slider1 = new BsSlider(0, 100, 25).set({ width: 200 });
    row1.add(slider1);
    container.add(row1);

    const row2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label2 = new qx.ui.basic.Label("-50 to 50");
    label2.setTextColor("var(--muted-foreground)");
    row2.add(label2);
    const slider2 = new BsSlider(-50, 50, 0).set({ width: 200 });
    row2.add(slider2);
    container.add(row2);

    const row3 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label3 = new qx.ui.basic.Label("0 to 1000");
    label3.setTextColor("var(--muted-foreground)");
    row3.add(label3);
    const slider3 = new BsSlider(0, 1000, 750).set({ width: 200 });
    row3.add(slider3);
    container.add(row3);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }

  private createStepSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Step");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const row1 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label1 = new qx.ui.basic.Label("Step 1 (default)");
    label1.setTextColor("var(--muted-foreground)");
    row1.add(label1);
    const slider1 = new BsSlider(0, 100, 10, 1).set({ width: 200 });
    row1.add(slider1);
    container.add(row1);

    const row2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label2 = new qx.ui.basic.Label("Step 5");
    label2.setTextColor("var(--muted-foreground)");
    row2.add(label2);
    const slider2 = new BsSlider(0, 100, 20, 5).set({ width: 200 });
    row2.add(slider2);
    container.add(row2);

    const row3 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label3 = new qx.ui.basic.Label("Step 10");
    label3.setTextColor("var(--muted-foreground)");
    row3.add(label3);
    const slider3 = new BsSlider(0, 100, 30, 10).set({ width: 200 });
    row3.add(slider3);
    container.add(row3);

    const row4 = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    const label4 = new qx.ui.basic.Label("Step 25");
    label4.setTextColor("var(--muted-foreground)");
    row4.add(label4);
    const slider4 = new BsSlider(0, 100, 50, 25).set({ width: 200 });
    row4.add(slider4);
    container.add(row4);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }

  private createDisabledSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Disabled State");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const container = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const enabledSlider = new BsSlider(0, 100, 50).set({ width: 200 });
    container.add(enabledSlider);

    const enabledLabel = new qx.ui.basic.Label("Enabled");
    enabledLabel.setTextColor("var(--muted-foreground)");
    container.add(enabledLabel);

    const separator = new qx.ui.core.Widget();
    separator.setHeight(20);
    container.add(separator);

    const disabledSlider = new BsSlider(0, 100, 50).set({ width: 200 });
    disabledSlider.setEnabled(false);
    container.add(disabledSlider);

    const disabledLabel = new qx.ui.basic.Label("Disabled");
    disabledLabel.setTextColor("var(--muted-foreground)");
    container.add(disabledLabel);

    card.setContent(container);

    const wrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    wrapper.add(sectionTitle);
    wrapper.add(card);
    return wrapper;
  }
}
