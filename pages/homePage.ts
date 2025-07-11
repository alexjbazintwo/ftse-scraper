import { expect, Locator, Page } from "@playwright/test";

export class HomePage {
  page: Page;
  cookiesAcceptButtonLocator: Locator;
  ftse100Link: Locator;
  allIndicesLink: Locator;
  ftse100IndicesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookiesAcceptButtonLocator = this.page.getByRole("button", {
      name: "Accept all cookies",
    });
    this.ftse100Link = this.page.getByRole("link", { name: "View FTSE 100" });
    this.allIndicesLink = this.page.getByRole("link", {
      name: "View all indices",
    });
    this.ftse100IndicesLink = this.page
      .getByRole("link", { name: "FTSE 100" })
      .nth(2);
  }

  async navigateToHomePage() {
    await this.page.goto("https://www.londonstockexchange.com");
    await expect(this.page).toHaveURL(/londonstockexchange\.com/);
    await expect(
      this.page.getByRole("heading", { name: "MARKETS LATEST" })
    ).toBeVisible();
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

  async navigateToFtse100IndicesGraph(): Promise<Page> {
    // Step 1: Click "All Indices" and wait for new tab/page
    const [indicesPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.allIndicesLink.click(),
    ]);
    await indicesPage.waitForLoadState("networkidle");
    await expect(
      indicesPage.getByRole("heading", { name: "FTSE INDICES" })
    ).toBeVisible();

    // Step 2: Click FTSE 100 link in the new tab, still on indicesPage
    await Promise.all([
      indicesPage.waitForLoadState("networkidle"),
      indicesPage.click('a[href="indices/ftse-100"]'), // or use a more specific locator on indicesPage
    ]);
    await expect(
      indicesPage.getByRole("heading", { name: "FTSE 100", exact: true })
    ).toBeVisible();

    return indicesPage; // return the new tab page object
  }
}
