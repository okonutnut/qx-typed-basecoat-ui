class ComboboxPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createDefaultSection());
    this.add(this.createDisabledSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
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
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const frameworks = [
      { value: "nextjs", label: "Next.js" },
      { value: "sveltekit", label: "SvelteKit" },
      { value: "nuxtjs", label: "Nuxt.js" },
      { value: "remix", label: "Remix" },
      { value: "astro", label: "Astro" },
    ];

    const combobox = new BsCombobox(frameworks, "Search framework...", undefined, "bottom").set({
      width: 250,
    });
    container.add(combobox);

    const valueLabel = new qx.ui.basic.Label("Value: ");
    valueLabel.setTextColor("var(--muted-foreground)");
    container.add(valueLabel);

    combobox.onChange((value: string) => {
      const selected =
        frameworks.find((f) => f.value === value)?.label ?? "None";
      valueLabel.setValue(`Value: ${selected} (${value})`);
    });

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

    const enabledCombobox = new BsCombobox(
      [
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
        { value: "c", label: "Option C" },
      ],
      "Search...",
    ).set({ width: 200 });
    container.add(enabledCombobox);

    const enabledLabel = new qx.ui.basic.Label("Enabled");
    enabledLabel.setTextColor("var(--muted-foreground)");
    container.add(enabledLabel);

    const separator = new qx.ui.core.Widget();
    separator.setHeight(20);
    container.add(separator);

    const disabledCombobox = new BsCombobox(
      [
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
        { value: "c", label: "Option C" },
      ],
      "Search...",
    ).set({ width: 200, enabled: false });
    container.add(disabledCombobox);

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
