import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Polyfill for window.matchMedia for Ant Design components in tests
if (!window.matchMedia) {
  window.matchMedia = function () {
    return {
      matches: false,
      media: "",
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      },
    };
  };
}

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
