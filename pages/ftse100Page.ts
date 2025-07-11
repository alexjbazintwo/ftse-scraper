import { Page, expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";
import { type Constituent } from "../interfaces/constituent";

export class Ftse100Page {
  constructor(private page: Page) {}

  async saveConstituentsSortedByChange(
    sortOrder: "Highest" | "Lowest",
    fileName: string
  ): Promise<Constituent[]> {
    if (sortOrder === "Lowest") {
      await this.sortByLowestPercentageChange();
    }

    const data = await this.extractTopConstituents(10);

    await this.saveDataToFile(data, fileName);

    return data;
  }

  private async sortByLowestPercentageChange() {
    const changeHeader = this.page.locator(
      "th.percentualchange span.indented.clickable"
    );
    await expect(changeHeader).toBeVisible();
    await expect(changeHeader).toBeEnabled();
    await changeHeader.click();

    const sortOption = this.page.locator(
      'th.percentualchange .sort-option div[title="Lowest – highest"]'
    );
    await expect(sortOption).toBeVisible();
    await expect(sortOption).toBeEnabled();
    await sortOption.click();
  }

  private async extractTopConstituents(limit: number): Promise<Constituent[]> {
    const rows = this.page.locator("tr.slide-panel");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    const maxRows = Math.min(limit, rowCount);
    const data: Constituent[] = [];

    for (let i = 0; i < maxRows; i++) {
      const row = rows.nth(i);

      const nameLocator = row.locator("td.instrument-name");
      const changeLocator = row.locator("td.instrument-netchange");
      const percentageChangeLocator = row.locator(
        "td.instrument-percentualchange"
      );

      await expect(nameLocator).toBeVisible();
      await expect(changeLocator).toBeVisible();
      await expect(percentageChangeLocator).toBeVisible();

      const name = await nameLocator.innerText();
      const change = await changeLocator.innerText();
      const percentageChange = await percentageChangeLocator.innerText();

      data.push({ name, change, percentageChange });
    }

    console.table(data);
    return data;
  }

  private async saveDataToFile(data: Constituent[], fileName: string) {
    const folderPath = path.resolve(process.cwd(), "savedData");
    const filePath = path.join(folderPath, fileName);

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`Data also saved to ${filePath} in JSON format`);
  }

  async getConstituentsByMarketCap(
    minCap: number
  ): Promise<{ name: string; marketCap: number }[]> {
    const cutoffAbsolute = minCap * 1_000_000_000;

    const header = this.page.locator("th.marketcap span.indented.clickable");
    await expect(header).toBeVisible();
    await expect(header).toBeEnabled();
    await header.click();

    const sortOption = this.page.locator(
      'th.marketcap .sort-option div[title="Highest – lowest"]'
    );
    await expect(sortOption).toBeVisible();
    await expect(sortOption).toBeEnabled();

    const firstRowNameLocator = this.page
      .locator("tr.slide-panel td.instrument-name")
      .first();
    const firstRowNameBefore = await firstRowNameLocator.innerText();

    await sortOption.click();

    await this.page.waitForFunction(
      (previousName) => {
        const firstRow = document.querySelector(
          "tr.slide-panel td.instrument-name"
        );
        return firstRow && firstRow.textContent?.trim() !== previousName.trim();
      },
      firstRowNameBefore,
      { timeout: 5000 }
    );

    const data: { name: string; marketCap: number }[] = [];
    const seenNames = new Set<string>();

    while (true) {
      const rows = this.page.locator("tr.slide-panel");
      const rowCount = await rows.count();
      await expect(rowCount).toBeGreaterThan(0);

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const nameLocator = row.locator("td.instrument-name");
        const capLocator = row.locator("td.instrument-marketcapitalization");

        await expect(nameLocator).toBeVisible();
        await expect(capLocator).toBeVisible();

        const name = (await nameLocator.innerText()).trim();
        const capText = await capLocator.innerText();

        await expect(capText).not.toBe("");
        expect(/[\d,.]+/.test(capText)).toBe(true);

        const cleanCap = capText.replace(/[^0-9.]/g, "");
        const marketCap = parseFloat(cleanCap) * 1_000_000;

        seenNames.add(name);

        if (marketCap >= cutoffAbsolute) {
          data.push({ name, marketCap });
        } else {
          console.table(
            data.map(({ name, marketCap }) => ({
              name,
              marketCap: (marketCap / 1000).toLocaleString("en-GB", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              }),
            }))
          );

          await this.saveMarketCapData(data);
          return data;
        }
      }

      const currentUrl = this.page.url();
      const currentPageMatch = currentUrl.match(/page=(\d+)/);
      const currentPage = currentPageMatch
        ? parseInt(currentPageMatch[1], 10)
        : 1;
      const nextPageNumber = currentPage + 1;

      const nextPageLink = this.page.locator("a.page-number", {
        hasText: nextPageNumber.toString(),
      });

      if (await nextPageLink.isVisible()) {
        await expect(nextPageLink).toBeEnabled();

        const firstRowTextBefore = await rows.first().innerText();

        await nextPageLink.click();

        await Promise.all([
          this.page.waitForFunction(
            (previousText) => {
              const el = document.querySelector(
                "tr.slide-panel td.instrument-name"
              );
              return el && el.textContent?.trim() !== previousText.trim();
            },
            firstRowTextBefore,
            { timeout: 7000 }
          ),
          this.page.waitForLoadState("networkidle"),
        ]);

        await this.page.waitForTimeout(300);

        await expect(this.page).toHaveURL(new RegExp(`page=${nextPageNumber}`));
      } else {
        break;
      }
    }

    console.table(
      data.map(({ name, marketCap }) => ({
        name,
        marketCap: (marketCap / 1000).toLocaleString("en-GB", {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }),
      }))
    );
    await this.saveMarketCapData(data);
    return data;
  }

  private async saveMarketCapData(
    data: { name: string; marketCap: number }[]
  ): Promise<void> {
    const folderPath = path.resolve(process.cwd(), "savedData");
    const filePath = path.join(folderPath, "market-cap-over-7-billion.json");

    const formattedData = data.map(({ name, marketCap }) => ({
      name,
      marketCap: (marketCap / 1000).toLocaleString("en-GB", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
    }));

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify(formattedData, null, 2),
      "utf-8"
    );

    console.log(`Data saved to ${filePath}`);
  }
}
