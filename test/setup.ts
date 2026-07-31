// Pin the timezone so date-formatting tests are deterministic regardless of the host machine/CI.
process.env.TZ = "UTC";

import "@testing-library/jest-dom";

// jsdom doesn't implement matchMedia; react-hot-toast's Toaster reads it to detect the
// prefers-reduced-motion media query.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
