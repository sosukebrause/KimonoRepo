// Exchange rates object (we'll update this with real rates)
const exchangeRates = {
  USD: 1,
  JPY: 149.5,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.35,
  AUD: 1.52,
};

class CurrencyConverter {
  constructor() {
    this.selectedCurrency = localStorage.getItem("selectedCurrency") || "USD";
    this.selectedSymbol = localStorage.getItem("selectedCountrySymbol") || "🇺🇸";
    this.priceElements = document.querySelectorAll(".price");
    this.originalPrices = new Map();

    // Store original USD prices
    this.priceElements.forEach((el) => {
      const priceText = el.textContent;
      const amount = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
      this.originalPrices.set(el, amount);
    });

    // Initialize prices with stored currency
    this.updateAllPrices();
  }

  async fetchLatestRates() {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );
      const data = await response.json();
      Object.assign(exchangeRates, data.rates);
      return true;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      return false;
    }
  }

  formatPrice(amount, currency) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "JPY" ? 0 : 2,
      maximumFractionDigits: currency === "JPY" ? 0 : 2,
    });
    return formatter.format(amount);
  }

  updateAllPrices() {
    const rate = exchangeRates[this.selectedCurrency];
    this.priceElements.forEach((el) => {
      const originalPrice = this.originalPrices.get(el);
      const convertedPrice = originalPrice * rate;
      el.textContent = this.formatPrice(convertedPrice, this.selectedCurrency);
    });
  }

  async changeCurrency(currency, symbol) {
    this.selectedCurrency = currency;
    this.selectedSymbol = symbol;

    // Store selection
    localStorage.setItem("selectedCurrency", currency);
    localStorage.setItem("selectedCountrySymbol", symbol);

    // Update display
    const selectedCountryElement = document.getElementById("selectedCountry");
    selectedCountryElement.textContent = `${symbol} ${currency}`;

    // Try to fetch latest rates first
    const ratesUpdated = await this.fetchLatestRates();
    if (!ratesUpdated) {
      console.log("Using fallback exchange rates");
    }

    // Update all prices
    this.updateAllPrices();
  }
}

// Initialize converter when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const converter = new CurrencyConverter();

  // Handle currency selection
  const countryDropdown = document.getElementById("countryDropdown");
  countryDropdown.addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
      const currency = e.target.dataset.currency;
      const symbol = e.target.dataset.symbol;
      await converter.changeCurrency(currency, symbol);
    }
  });
});
