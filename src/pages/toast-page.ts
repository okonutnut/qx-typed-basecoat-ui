class ToastPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicSection());
    this.add(this.createCategoriesSection());
    this.add(this.createWithDescriptionSection());
    this.add(this.createWithActionSection());
    this.add(this.createWithCancelSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private createBasicSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Basic Toast");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const descriptionLabel = new qx.ui.basic.Label(
      "A simple toast with title only.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const showToastBtn = new BsButton("Show Toast");
    showToastBtn.addListener("execute", () => {
      BsToast.show({
        title: "Toast Title",
      });
    });
    buttonRow.add(showToastBtn);

    contentContainer.add(buttonRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createCategoriesSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Toast Categories");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const descLabel = new qx.ui.basic.Label(
      "Different toast categories: success, info, warning, error.",
    );
    contentContainer.add(descLabel);

    const buttonRow1 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const successBtn = new BsButton("Success", undefined, { variant: "secondary" });
    successBtn.addListener("execute", () => {
      BsToast.success("Success!", "Your operation completed successfully.");
    });
    buttonRow1.add(successBtn);

    const infoBtn = new BsButton("Info", undefined, { variant: "secondary" });
    infoBtn.addListener("execute", () => {
      BsToast.info("Information", "Here is some useful information.");
    });
    buttonRow1.add(infoBtn);

    contentContainer.add(buttonRow1);

    const buttonRow2 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const warningBtn = new BsButton("Warning", undefined, { variant: "secondary" });
    warningBtn.addListener("execute", () => {
      BsToast.warning("Warning", "Please review your input before proceeding.");
    });
    buttonRow2.add(warningBtn);

    const errorBtn = new BsButton("Error", undefined, { variant: "destructive" });
    errorBtn.addListener("execute", () => {
      BsToast.error("Error", "An error occurred while processing your request.");
    });
    buttonRow2.add(errorBtn);

    contentContainer.add(buttonRow2);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithDescriptionSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Description");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const descriptionLabel = new qx.ui.basic.Label(
      "Toast with title and description text.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const withDescBtn = new BsButton("Show with Description");
    withDescBtn.addListener("execute", () => {
      BsToast.show({
        title: "Event Created",
        description: "Sunday, December 03, 2023 at 9:00 AM",
        category: "success",
      });
    });
    buttonRow.add(withDescBtn);

    contentContainer.add(buttonRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithActionSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Action Button");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const descriptionLabel = new qx.ui.basic.Label(
      "Toast with an action button.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const actionBtn = new BsButton("With Action");
    actionBtn.addListener("execute", () => {
      BsToast.show({
        title: "File Saved",
        description: "Your changes have been saved successfully.",
        category: "success",
        action: {
          label: "Undo",
          onclick: (close) => {
            console.log("Undo clicked");
            close();
          },
        },
      });
    });
    buttonRow.add(actionBtn);

    contentContainer.add(buttonRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithCancelSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Cancel Button");
    sectionTitle.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    sectionTitle.setTextColor("var(--foreground)");

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center" }),
    );

    const descriptionLabel = new qx.ui.basic.Label(
      "Toast with a cancel/dismiss button.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const cancelBtn = new BsButton("With Cancel");
    cancelBtn.addListener("execute", () => {
      BsToast.show({
        title: "Item Deleted",
        description: "The item has been removed from your list.",
        category: "warning",
        cancel: {
          label: "Undo",
          onclick: () => {
            console.log("Undo action triggered");
          },
        },
      });
    });
    buttonRow.add(cancelBtn);

    contentContainer.add(buttonRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}