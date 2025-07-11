# 🎯 FTSE 100 Web Scraping Automation (SDET Technical Test)

This project is a Playwright + TypeScript automation suite using data from the [London Stock Exchange](https://www.londonstockexchange.com/).

It dynamically navigates to the FTSE 100 table and:
1. Extracts and displays the **top 10 highest % change** constituents
2. Extracts and displays the **top 10 lowest % change** constituents
3. Extracts and displays **all constituents with Market Cap over £7 million**
4. Determines the **month with the lowest average FTSE 100 index value** over the past 3 years

Furthermore it includes assertions and is dynamic (changing depending on the real FTSE 100 values)

---

## 🧪 Test Scenarios Implemented

### 1. Top 10 by **Highest % Change**

- Sorts by `% Change` > `Highest – lowest` (table already sorted on arriving to page so no sorting required)
- Extracts the top 10 visible rows
- Logs data to the console
- Saves data as JSON to:  
  `savedData/percentage-change-top-10-highest.json`

### 2. Top 10 by **Lowest % Change**

- Sorts by `Change %` > `Lowest – highest`
- Extracts the top 10 visible rows
- Logs data to the console
- Saves data as JSON to:  
  `savedData/percentage-change-top-10-lowest.json`

### 3. All **Market Cap > £7 million**

- Sorts by **Market Cap (Highest – lowest)**
- Pages through the table extracting all company names and market cap data
- Stops once market cap drops below £7M
- Logs data to the console
- Saves data as JSON to:  
  `savedData/market-cap-over-7-million.json`


### 4. **Lowest Average Index Month in Past 3 Years**

- Navigates to the FTSE 100 index page
- Extracts historical monthly index values
- Aggregates data by month
- Finds the **month and year with lowest average**
- Logs result to console

Note: saveData directory has been added to gitignore and will only be created when you run the tests

---

## 🔧 Setup & Running

### 1. Clone the repository

git clone [https://github.com/alexjbazintwo/ftse-scraper]
cd ftse-scraper



### 2. Install dependencies

npm install



### 3. Run the tests

(To save time all tests will run in Chromium only in the commands below)

Using scripts:

npm run test (will run in CI mode in your terminal)
npm run test:debug (will run in debug mode to step through each part of the test)

Without scripts:

npx playwright test --project=chromium (will run in CI mode in your terminal)
npx playwright test --project=chromium --debug (will run in debug mode to step through each part of the test)

The above will run all tests in the londonStockExchange.spec.ts file. If you would like to run only one file, you can add .only on any test





