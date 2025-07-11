import { Page, expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";

type Constituent = {
  name: string;
  change: string;
  percentageChange: string;
};

export class Ftse100Page {
  constructor(private page: Page) {}

  //   async saveConstituentsSortedByChange(
  //     sortOrder: "Highest" | "Lowest",
  //     fileName: string
  //   ): Promise<Constituent[]> {
  //     if (sortOrder === "Lowest") {
  //       await this.sortByLowestPercentageChange();
  //     }

  //     const data = await this.extractTopConstituents(10);

  //     await this.saveDataToFile(data, fileName);

  //     return data;
  //   }

  //   private async sortByLowestPercentageChange() {
  //     const changeHeader = this.page.locator(
  //       "th.percentualchange span.indented.clickable"
  //     );
  //     await expect(changeHeader).toBeVisible();
  //     await expect(changeHeader).toBeEnabled();
  //     await changeHeader.click();

  //     const sortOption = this.page.locator(
  //       'th.percentualchange .sort-option div[title="Lowest – highest"]'
  //     );
  //     await expect(sortOption).toBeVisible();
  //     await expect(sortOption).toBeEnabled();
  //     await sortOption.click();
  //   }

  //   private async extractTopConstituents(limit: number): Promise<Constituent[]> {
  //     const rows = this.page.locator("tr.slide-panel");
  //     const rowCount = await rows.count();
  //     expect(rowCount).toBeGreaterThan(0);

  //     const maxRows = Math.min(limit, rowCount);
  //     const data: Constituent[] = [];

  //     for (let i = 0; i < maxRows; i++) {
  //       const row = rows.nth(i);

  //       const nameLocator = row.locator("td.instrument-name");
  //       const changeLocator = row.locator("td.instrument-netchange");
  //       const percentageChangeLocator = row.locator(
  //         "td.instrument-percentualchange"
  //       );

  //       await expect(nameLocator).toBeVisible();
  //       await expect(changeLocator).toBeVisible();
  //       await expect(percentageChangeLocator).toBeVisible();

  //       const name = await nameLocator.innerText();
  //       const change = await changeLocator.innerText();
  //       const percentageChange = await percentageChangeLocator.innerText();

  //       data.push({ name, change, percentageChange });
  //     }

  //     console.table(data);
  //     return data;
  //   }

  //   private async saveDataToFile(data: Constituent[], fileName: string) {
  //     const folderPath = path.resolve(process.cwd(), "savedData");
  //     const filePath = path.join(folderPath, fileName);

  //     await fs.mkdir(folderPath, { recursive: true });
  //     await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  //     console.log(`Data also saved to ${filePath} in JSON format`);
  //   }

  //   async getConstituentsByMarketCap(
  //     minCap: number
  //   ): Promise<{ name: string; marketCap: number }[]> {
  //     // Click "Market Cap" header
  //     const capHeader = this.page.locator("th.marketcap span.indented.clickable");
  //     await expect(capHeader).toBeVisible();
  //     await expect(capHeader).toBeEnabled();
  //     await capHeader.click();

  //     // Click "Highest – lowest" in dropdown
  //     const sortOption = this.page.locator(
  //       'th.marketcap .sort-option div[title="Highest – lowest"]'
  //     );
  //     await expect(sortOption).toBeVisible();
  //     await expect(sortOption).toBeEnabled();
  //     await sortOption.click();

  //     const data: { name: string; marketCap: number }[] = [];

  //     while (true) {
  //       const rows = this.page.locator("tr.slide-panel");
  //       const rowCount = await rows.count();
  //       expect(rowCount).toBeGreaterThan(0);

  //       const firstRowText = await rows.first().innerText(); // for pagination check

  //       for (let i = 0; i < rowCount; i++) {
  //         const row = rows.nth(i);

  //         const nameLocator = row.locator("td.instrument-name");
  //         const capLocator = row.locator("td.instrument-marketcapitalization");

  //         await expect(nameLocator).toBeVisible();
  //         await expect(capLocator).toBeVisible();

  //         const name = await nameLocator.innerText();
  //         const capText = await capLocator.innerText();
  //         const numericCap = this.parseMarketCap(capText);

  //         if (numericCap < minCap) {
  //           console.table(data);
  //           await this.saveMarketCapData(data);
  //           return data;
  //         }

  //         data.push({ name, marketCap: numericCap });
  //       }

  //       // Check for "Next" pagination link
  //       const nextPage = this.page.locator("a.pagination-next");

  //       // Get current page number
  //       const currentUrl = this.page.url();
  //       const currentPageMatch = currentUrl.match(/page=(\d+)/);
  //       const currentPage = currentPageMatch
  //         ? parseInt(currentPageMatch[1], 10)
  //         : 1;

  //       // Attempt to find link to the next page (page N + 1)
  //       const nextPageNumber = currentPage + 1;
  //       const nextPageLink = this.page.getByRole("link", {
  //         name: nextPageNumber.toString(),
  //       });

  //       if (await nextPageLink.isVisible()) {
  //         const firstRowText = await rows.first().innerText();
  //         await nextPageLink.click();

  //         // Wait until page has changed
  //         await this.page.waitForFunction(
  //           (oldText) => {
  //             const firstRow = document.querySelector(
  //               "tr.slide-panel td.instrument-name"
  //             );
  //             return firstRow && firstRow.textContent?.trim() !== oldText.trim();
  //           },
  //           firstRowText,
  //           { timeout: 5000 }
  //         );
  //       } else {
  //         break;
  //       }
  //     }

  //     // Fallback in case all rows are >= minCap
  //     console.table(data);
  //     await this.saveMarketCapData(data);
  //     return data;
  //   }

  //   private parseMarketCap(text: string): number {
  //     const clean = text.replace(/[^0-9.]/g, "");
  //     return parseFloat(clean) * 1_000_000; // assumes values are in millions
  //   }

  //   private async saveMarketCapData(
  //     data: { name: string; marketCap: number }[]
  //   ): Promise<void> {
  //     const folderPath = path.resolve(process.cwd(), "savedData");
  //     const filePath = path.join(folderPath, "market-cap-over-7-million.json");

  //     await fs.mkdir(folderPath, { recursive: true });
  //     await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

  //     console.log(`Data saved to ${filePath}`);
  //   }

  async getConstituentsByMarketCap(
    minCap: number
  ): Promise<{ name: string; marketCap: number }[]> {
    const cutoffAbsolute = minCap * 1_000_000; // Convert minCap millions to absolute number

    // Step 1: Sort by Market Cap descending
    const header = this.page.locator("th.marketcap span.indented.clickable");
    await expect(header).toBeVisible();
    await header.click();

    const sortOption = this.page.locator(
      'th.marketcap .sort-option div[title="Highest – lowest"]'
    );
    // await expect(sortOption).toBeVisible();
    await sortOption.click();


    const data: { name: string; marketCap: number }[] = [];

    while (true) {
      const rows = this.page.locator("tr.slide-panel");
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const name = await row.locator("td.instrument-name").innerText();
        const capText = await row
          .locator("td.instrument-marketcapitalization")
          .innerText();

        const cleanCap = capText.replace(/[^0-9.]/g, "");
        const marketCap = parseFloat(cleanCap) * 1_000_000;

        if (marketCap >= cutoffAbsolute) {
          data.push({ name, marketCap });
        } else {
          // Stop if we hit a row below threshold
          console.log("Stopped: market cap dropped below threshold");
          console.table(data);

          await this.saveMarketCapData(data);
          return data;
        }
      }

      // Pagination - find next page link
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
        const firstRowText = await rows.first().innerText();
        await nextPageLink.click();

        // Wait until the new page's first row is different (page loaded)
        await this.page.waitForFunction(
          (previousText) => {
            const el = document.querySelector(
              "tr.slide-panel td.instrument-name"
            );
            return el && el.textContent?.trim() !== previousText.trim();
          },
          firstRowText,
          { timeout: 5000 }
        );
      } else {
        break; // No more pages
      }
    }

    // Final save
    console.table(data);
    await this.saveMarketCapData(data);
    return data;
  }

  // Separate helper method for saving data:
  private async saveMarketCapData(
    data: { name: string; marketCap: number }[]
  ): Promise<void> {
    const folderPath = path.resolve(process.cwd(), "savedData");
    const filePath = path.join(folderPath, "market-cap-over-7-million.json");

    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`Data saved to ${filePath}`);
  }
}
