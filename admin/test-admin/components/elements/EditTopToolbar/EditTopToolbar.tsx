import { Button, TopToolbar } from "react-admin";
import { IEditTopToolbarProps } from "../../../types/elements";

export const EditTopToolbar = ({
  handleClone,
  spinner,
}: IEditTopToolbarProps) => (
  <TopToolbar>
    <Button
      onClick={handleClone}
      disabled={spinner}
      label={spinner ? "Копіювання..." : "Копіювати товар"}
    />
  </TopToolbar>
);
