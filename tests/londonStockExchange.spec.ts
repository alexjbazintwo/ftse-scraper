// tests/ftse100.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { Ftse100Page } from "../pages/ftse100Page";

test.describe("FTSE 100 Analysis", () => {
  let homePage: HomePage;
  let ftse100Page: Ftse100Page;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHomePage();
    await homePage.acceptCookies();

    const newPage = await homePage.navigateToFtse100();
    ftse100Page = new Ftse100Page(newPage);
  });

  test("Latest top 10 constituents with the highest percentage change", async () => {
    await ftse100Page.saveConstituentsSortedByChange(
      "Highest",
      "top-10-constituents-highest-percentage-change.json"
    );
  });

  test("Latest top 10 constituents with the lowest percentage change", async () => {
    await ftse100Page.saveConstituentsSortedByChange(
      "Lowest",
      "top-10-constituents-lowest-percentage-change.json"
    );
  });

  test("Constituents with Market Cap over £7 million", async () => {
    const data = await ftse100Page.getConstituentsByMarketCap(7);
  });

  //   test("Month with lowest average index in past 3 years", async () => {
  //     const lowest = await ftse100Page.getMonthWithLowestAverageIndex();
  //     console.log(`Lowest month: ${lowest.month}, Avg: ${lowest.average}`);
  //     expect(lowest).toHaveProperty("month");
  //     expect(lowest).toHaveProperty("average");
  //   });
});
