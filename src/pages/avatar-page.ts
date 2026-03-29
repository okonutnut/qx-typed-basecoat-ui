class AvatarPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createShapesSection());
    this.add(this.createFallbackSection());
    this.add(this.createSizesSection());
    this.add(this.createGroupSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createShapesSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Shapes");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const shapesContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({ alignX: "center", alignY: "middle" }),
    );

    shapesContainer.add(
      new BsAvatar("resource/app/morty.png", "Morty", "M", "", "full"),
    );
    shapesContainer.add(
      new BsAvatar("resource/app/morty.png", "Morty", "M", "", "rounded"),
    );
    shapesContainer.add(
      new BsAvatar("resource/app/morty.png", "Morty", "M", "", "square"),
    );

    card.setContent(shapesContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createFallbackSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Fallback");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const fallbackContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({ alignX: "center", alignY: "middle" }),
    );

    fallbackContainer.add(new BsAvatar("resource/app/morty.png", "Morty", "M"));
    fallbackContainer.add(new BsAvatar(undefined, "User", "A"));
    fallbackContainer.add(new BsAvatar(undefined, "User", "B"));
    fallbackContainer.add(
      new BsAvatar(undefined, "User", "John Doe", "", "full"),
    );

    card.setContent(fallbackContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createSizesSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Sizes");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const sizesContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(16).set({
        alignX: "center",
        alignY: "middle",
      }),
    );
    sizesContainer.setHeight(100);
    sizesContainer.setAlignX("center");
    sizesContainer.setAlignY("middle");

    const small = new BsAvatar(
      "resource/app/morty.png",
      "Morty",
      "M",
      "size-6",
    );
    const defaultSize = new BsAvatar(
      "resource/app/morty.png",
      "Morty",
      "M",
      "size-8",
    );
    const large = new BsAvatar(
      "resource/app/morty.png",
      "Morty",
      "M",
      "size-12",
    );
    const xl = new BsAvatar("resource/app/morty.png", "Morty", "M", "size-16");

    sizesContainer.add(small);
    sizesContainer.add(defaultSize);
    sizesContainer.add(large);
    sizesContainer.add(xl);

    card.setContent(sizesContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createGroupSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Avatar Group");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const groupContainer = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(0).set({ alignX: "center", alignY: "middle" }),
    );

    const avatars = [
      new BsAvatar(
        "resource/app/morty.png",
        "Morty",
        "M",
        "-ml-2 border-2 border-background",
      ),
      new BsAvatar(
        "resource/app/morty.png",
        "Morty",
        "M",
        "-ml-2 border-2 border-background",
      ),
      new BsAvatar(
        "resource/app/morty.png",
        "Morty",
        "M",
        "-ml-2 border-2 border-background",
      ),
      new BsAvatar(
        "resource/app/morty.png",
        "Morty",
        "M",
        "-ml-2 border-2 border-background",
      ),
      new BsAvatar(undefined, "More", "+2", "-ml-2 border-2 border-background"),
    ];

    avatars.forEach((avatar) => groupContainer.add(avatar));

    card.setContent(groupContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}
