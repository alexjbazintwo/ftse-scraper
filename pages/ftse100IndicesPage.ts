import { Page, expect } from "@playwright/test";
import { promises as fs } from "fs";
import path from "path";

export class Ftse100IndicesPage {
  constructor(private page: Page) {}

  async getLowestClosePriceFromNetwork() {
    let capturedResponse;

    this.page.on("response", async (response) => {
      const url = response.url();
      if (
        url.includes("/rest/api/timeseries/historical") &&
        response.status() === 200
      ) {
        capturedResponse = response;
      }
    });

    const yearInput = this.page.getByRole("textbox", {
      name: "Year in from date",
    });
    await expect(yearInput).toBeVisible();

    const currentYear = new Date().getFullYear();
    const targetYear = (currentYear - 3).toString();

    await yearInput.fill(targetYear);
    await yearInput.press("Enter");

    const periodicityButton = this.page.getByRole("button", {
      name: /periodicity/i,
    });
    await expect(periodicityButton).toBeVisible();
    await periodicityButton.click();

    const monthlyMenuItem = this.page.getByRole("menuitem", {
      name: "Monthly",
    });
    await expect(monthlyMenuItem).toBeVisible();
    await monthlyMenuItem.click();

    // Wait a bit for network to respond
    await this.page.waitForTimeout(2000);

    if (!capturedResponse) {
      throw new Error("Network response was not captured");
    }

    const json = await capturedResponse.json();
    const data = json.data;

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    let lowest = Number.POSITIVE_INFINITY;
    let lowestDate = "";

    for (const eachDataPoint of data) {
      const close = parseFloat(eachDataPoint.CLOSE_PRC);
      if (!isNaN(close) && close < lowest) {
        lowest = close;
        lowestDate = eachDataPoint._DATE_END;
      }
    }

    expect(lowest).toBeGreaterThan(0);
    expect(typeof lowestDate).toBe("string");
    expect(lowestDate.length).toBeGreaterThan(0);

    console.log(`✅ Lowest Close Price: ${lowest} on ${lowestDate}`);

    return { lowest, lowestDate };
  }
}
