class AlertDialogPage extends qx.ui.container.Composite {
  private __responsiveWidth = 0;

  constructor() {
    super(new qx.ui.layout.VBox(20));
    this.setPadding(20);

    this.__responsiveWidth = qx.bom.Viewport.getWidth();
    this.add(this.createBasicSection());
    this.add(this.createWithDescriptionSection());
    this.add(this.createButtonVariationsSection());
    this.add(this.createWithChildrenSection());

    qx.event.Registration.addListener(window, "resize", this.__onResize, this);
  }

  private __onResize(): void {
    this.__responsiveWidth = qx.bom.Viewport.getWidth();
  }

  private __isMobile(): boolean {
    return this.__responsiveWidth < 768;
  }

  private __createTriggerButton(
    label: string,
    variant?: "default" | "secondary" | "destructive" | "outline",
  ): BsButton {
    return new BsButton(label, undefined, { variant: variant ?? "default" });
  }

  private createBasicSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Basic Alert Dialog");
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
      "A simple alert dialog with title only.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const simpleAlertBtn = this.__createTriggerButton("Show Alert");
    simpleAlertBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Are you sure?",
        footerButtons: "ok",
        continueLabel: "OK",
      });
    });
    buttonRow.add(simpleAlertBtn);

    contentContainer.add(buttonRow);
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
      "Alert dialog with title and description text.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const withDescBtn = this.__createTriggerButton("Show with Description");
    withDescBtn.setWidth(160);
    withDescBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Delete Account",
        description:
          "This action cannot be undone. All your data will be permanently removed.",
        footerButtons: "ok-cancel",
        cancelLabel: "Cancel",
        continueLabel: "Delete",
        onContinue: () => {
          console.log("Delete confirmed");
        },
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

  private createButtonVariationsSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("Button Variations");
    sectionTitle.set({
      font:
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }),
      textColor: "var(--foreground)",
    });

    const card = new BsCard();
    card.setMaxWidth(this.__isMobile() ? this.__responsiveWidth - 40 : 520);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(16).set({ alignX: "center" }),
    );

    const descLabel = new qx.ui.basic.Label(
      "Different footer button configurations.",
    );
    contentContainer.add(descLabel);

    const row1 = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const okOnlyBtn = this.__createTriggerButton("OK Only");
    okOnlyBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Operation Complete",
        description: "The task has been completed successfully.",
        footerButtons: "ok",
      });
    });
    row1.add(okOnlyBtn);

    const okCancelBtn = this.__createTriggerButton("OK / Cancel");
    okCancelBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Save Changes?",
        description: "Do you want to save your changes?",
        footerButtons: "ok-cancel",
      });
    });
    row1.add(okCancelBtn);

    const cancelOnlyBtn = this.__createTriggerButton("Cancel Only");
    cancelOnlyBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Continue Operation?",
        description: "Do you want to continue with this operation?",
        footerButtons: "cancel",
        cancelLabel: "Continue",
      });
    });
    row1.add(cancelOnlyBtn);

    contentContainer.add(row1);

    const customLabelsRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const customLabelsBtn = this.__createTriggerButton(
      "Custom Labels",
      "secondary",
    );
    customLabelsBtn.setWidth(120);
    customLabelsBtn.addListener("execute", () => {
      BsAlertDialog.show({
        title: "Confirm Action",
        description: "Please confirm you want to proceed.",
        footerButtons: "ok-cancel",
        cancelLabel: "No, Go Back",
        continueLabel: "Yes, Proceed",
        onContinue: () => {
          console.log("Custom label continue clicked");
        },
      });
    });
    customLabelsRow.add(customLabelsBtn);

    contentContainer.add(customLabelsRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }

  private createWithChildrenSection(): qx.ui.core.Widget {
    const sectionTitle = new qx.ui.basic.Label("With Qooxdoo Children");
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
      "Alert dialog with Qooxdoo widgets as body content.",
    );
    contentContainer.add(descriptionLabel);

    const buttonRow = new qx.ui.container.Composite(
      new qx.ui.layout.HBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const withChildrenBtn = this.__createTriggerButton(
      "Show with Widget",
      "secondary",
    );
    withChildrenBtn.setWidth(150);
    withChildrenBtn.addListener("execute", () => {
      const formContainer = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(12),
      );
      formContainer.setLayoutProperties({ flex: 1 });
      formContainer.setWidth(null);
      formContainer.setMinWidth(0);
      formContainer.setAllowGrowX(true);

      const nameField = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(4),
      );
      nameField.setWidth(null);
      nameField.setMinWidth(0);
      nameField.setAllowGrowX(true);
      nameField.add(new BsLabel("Name:"));
      const nameInput = new BsInput("", "Enter your name");
      nameInput.setWidth(null);
      nameInput.setMinWidth(0);
      nameInput.setAllowGrowX(true);
      nameField.add(nameInput);

      const emailField = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(4),
      );
      emailField.setWidth(null);
      emailField.setMinWidth(0);
      emailField.setAllowGrowX(true);
      emailField.add(new BsLabel("Email:"));
      const emailInput = new BsInput("", "Enter your email");
      emailInput.setWidth(null);
      emailInput.setMinWidth(0);
      emailInput.setAllowGrowX(true);
      emailField.add(emailInput);

      formContainer.add(nameField);
      formContainer.add(emailField);

      BsAlertDialog.show({
        title: "Enter Details",
        footerButtons: "ok-cancel",
        cancelLabel: "Cancel",
        continueLabel: "Submit",
        onContinue: () => {
          console.log("Name:", nameInput.getValue());
          console.log("Email:", emailInput.getValue());
        },
        children: formContainer,
      });
    });
    buttonRow.add(withChildrenBtn);

    contentContainer.add(buttonRow);
    card.setContent(contentContainer);

    const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    container.add(sectionTitle);
    container.add(card);
    return container;
  }
}
