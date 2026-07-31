import { screen } from "@testing-library/react";

import { NotFoundPage } from "@/presentation/features/layout/not-found-page";
import { renderWithProviders } from "@test/support/render-with-providers";

describe("NotFoundPage", () => {
  it("renders a 404 message with a link back to boards", () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your boards" })).toHaveAttribute(
      "href",
      "/boards",
    );
  });
});
