import { expect, Locator, Page } from "@playwright/test";

export class HomePage {
  page: Page;
  cookiesAcceptButtonLocator: Locator;
  ftse100Link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookiesAcceptButtonLocator = this.page.getByRole("button", {
      name: "Accept all cookies",
    });
    this.ftse100Link = this.page.getByRole("link", { name: "View FTSE 100" });
  }

  async navigateToHomePage() {
    await this.page.goto("https://www.londonstockexchange.com");
    await expect(this.page).toHaveURL(/londonstockexchange\.com/);
    await expect(this.page.getByRole("heading", { name: "MARKETS LATEST" })).toBeVisible();
    await this.page.waitForLoadState("networkidle");
  }

  async acceptCookies() {
    if (await this.cookiesAcceptButtonLocator.isVisible()) {
      await this.cookiesAcceptButtonLocator.click();
    }
  }

  async navigateToFtse100(): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.ftse100Link.click(),
    ]);

    await newPage.waitForLoadState("networkidle");
    await expect(
      this.page.getByRole("heading", { name: "FTSE 100" })
    ).toBeVisible();


    return newPage;
  }
}
