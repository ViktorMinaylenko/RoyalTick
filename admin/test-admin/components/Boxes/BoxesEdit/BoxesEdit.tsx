import { Edit } from "react-admin";
import { BOXES_SOURCE_NAME } from "../../../constants/sourceNames";
import { BOXES_TYPES } from "../../../constants/goodsTypes";
import { useGoodsEdition } from "../../../hooks/useGoodsEdition";
import { EditTopToolbar } from "../../elements/EditTopToolbar/EditTopToolbar";
import { BoxesForm } from "../BoxesForm/BoxesForm";

export const BoxesEdit = () => {
  const {
    type,
    handleSelectType,
    maxImagesCount,
    handleClone,
    cloneProductSpinner,
  } = useGoodsEdition(BOXES_SOURCE_NAME, BOXES_TYPES);
  return (
    <Edit
      actions={
        <EditTopToolbar
          handleClone={handleClone}
          spinner={cloneProductSpinner}
        />
      }
    >
      <BoxesForm
        type={type}
        handleSelectType={handleSelectType}
        maxImagesCount={maxImagesCount}
      />
    </Edit>
  );
};
