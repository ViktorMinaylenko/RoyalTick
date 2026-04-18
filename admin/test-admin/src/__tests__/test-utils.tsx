import { render } from "@testing-library/react";
import { AdminContext } from "react-admin";
import React from "react";

export const renderWithAdmin = (ui: React.ReactElement) => {
  return render(<AdminContext>{ui}</AdminContext>);
};
