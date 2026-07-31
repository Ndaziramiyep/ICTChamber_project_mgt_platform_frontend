import { render, screen } from "@testing-library/react";

import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";

describe("FormField", () => {
  it("associates the label with the control via htmlFor/id", () => {
    render(
      <FormField label="Email address">
        <Input type="email" />
      </FormField>,
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("shows a hint and links it via aria-describedby", () => {
    render(
      <FormField label="Board title" hint="Keep it short.">
        <Input />
      </FormField>,
    );

    const input = screen.getByLabelText("Board title");
    expect(screen.getByText("Keep it short.")).toHaveAttribute(
      "id",
      input.getAttribute("aria-describedby"),
    );
  });

  it("shows an error message with role=alert and marks the control invalid", () => {
    render(
      <FormField label="Email address" errorMessage="Email is required.">
        <Input />
      </FormField>,
    );

    const input = screen.getByLabelText("Email address");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required.");
  });
});
