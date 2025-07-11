import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { Ftse100Page, Ftse100IndicesPage } from "../pages";

test.describe("FTSE 100 Analysis", () => {
  let homePage: HomePage;
  let ftse100Page: Ftse100Page;
  let ftse100IndicesPage: Ftse100IndicesPage;

  test.beforeEach(async ({ page }, testInfo) => {
    homePage = new HomePage(page);
    await homePage.navigateToHomePage();
    await homePage.acceptCookies();
  });

  test("Latest top 10 constituents with the highest percentage change", async () => {
    const newFtse100Page = await homePage.navigateToFtse100();
    ftse100Page = new Ftse100Page(newFtse100Page);
    await ftse100Page.saveConstituentsSortedByChange(
      "Highest",
      "top-10-constituents-highest-percentage-change.json"
    );
  });

  test("Latest top 10 constituents with the lowest percentage change", async () => {
    const newFtse100Page = await homePage.navigateToFtse100();
    ftse100Page = new Ftse100Page(newFtse100Page);
    await ftse100Page.saveConstituentsSortedByChange(
      "Lowest",
      "top-10-constituents-lowest-percentage-change.json"
    );
  });

  test("Constituents with Market Cap over £7 million", async () => {
    const newFtse100Page = await homePage.navigateToFtse100();
    ftse100Page = new Ftse100Page(newFtse100Page);
    await ftse100Page.getConstituentsByMarketCap(7);
  });

  test("Month with lowest average index in past 3 years", async ({}) => {
    const newFtse100IndicesPage =
      await homePage.navigateToFtse100IndicesGraph();
    ftse100IndicesPage = new Ftse100IndicesPage(newFtse100IndicesPage);
    await ftse100IndicesPage.getLowestClosePriceFromNetwork();
  });
});
